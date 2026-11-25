import { dialog, ipcMain } from 'electron';
import PupillometryRepository from '../../../main/store/repository/PupillometryRepository';
import { State } from '../../interfaces';
import PupillometryChannel, {
  IPupillometryRequest,
} from '../PupillometryChannel';

jest.mock('electron', () => {
  const { EventEmitter } = jest.requireActual('events');
  return {
    BrowserWindow: jest.fn(),
    dialog: {
      showOpenDialog: jest.fn(),
    },
    ipcMain: new EventEmitter(),
    shell: {
      openPath: jest.fn(),
    },
  };
});

jest.mock('../../../main/pupillary/export', () => ({
  __esModule: true,
  default: {
    saveGroupedMetrics: jest.fn(),
    saveSamples: jest.fn(),
  },
}));

jest.mock('../../../main/store/repository/PupillometryRepository', () => ({
  __esModule: true,
  default: {
    process: jest.fn(),
    test: jest.fn(),
  },
}));

const config = { name: 'test config' } as IConfig;
const result: IPupillometryResult = {
  name: 'respondent.csv',
  config: config.name,
  segments: [],
};
const event = {
  sender: {
    send: jest.fn(),
  },
} as unknown as Electron.IpcMainEvent;
const window = {} as Electron.BrowserWindow;

describe('PupillometryChannel', () => {
  const channel = new PupillometryChannel(window);

  beforeEach(() => {
    jest.clearAllMocks();
    ipcMain.removeAllListeners();
  });

  test('sends progress and a successful result for process requests', async () => {
    const loadingResponse = {
      result: [result],
      state: State.Loading,
      progress: 0.5,
    };
    jest
      .mocked(PupillometryRepository.process)
      .mockImplementation(async (_paths, _config, saveCallback) => {
        saveCallback(loadingResponse);
        return [result];
      });

    await channel.handle(event, {
      method: 'process',
      responseChannel: 'process-response',
      query: {
        form: {
          config,
          files: [{ path: '/data/respondent.csv' }],
        },
      },
    });

    expect(PupillometryRepository.process).toHaveBeenCalledWith(
      ['/data/respondent.csv'],
      config,
      expect.any(Function)
    );
    expect(event.sender.send).toHaveBeenNthCalledWith(
      1,
      'process-response',
      { progress: 0, state: State.Loading, result: [] }
    );
    expect(event.sender.send).toHaveBeenNthCalledWith(
      2,
      'process-response',
      loadingResponse
    );
    expect(event.sender.send).toHaveBeenLastCalledWith('process-response', {
      progress: 1,
      state: State.Done,
      result: [result],
    });
  });

  test('sends a channel error when processing rejects', async () => {
    jest
      .mocked(PupillometryRepository.process)
      .mockRejectedValue(new Error('invalid file'));

    await channel.handle(event, {
      method: 'process',
      responseChannel: 'process-response',
      query: {
        form: {
          config,
          files: [{ path: '/data/respondent.csv' }],
        },
      },
    });

    expect(event.sender.send).toHaveBeenLastCalledWith('process-response', {
      progress: 0,
      state: State.Error,
      result: [],
      error: 'Cannot process the selected files: invalid file',
    });
  });

  test('routes internal progress through ipcMain', async () => {
    const internalResponse = {
      result: [result],
      state: State.Loading,
      progress: 0.5,
    };
    const listener = jest.fn();
    ipcMain.on('study-response', listener);
    jest
      .mocked(PupillometryRepository.process)
      .mockImplementation(async (_paths, _config, saveCallback) => {
        saveCallback(internalResponse);
        return [result];
      });

    await channel.handle(event, {
      method: 'process',
      internal: true,
      responseChannel: 'study-response',
      query: {
        form: {
          config,
          files: [{ path: '/data/respondent.csv' }],
        },
      },
    } as IPupillometryRequest);

    expect(listener).toHaveBeenCalledWith(event, internalResponse);
    expect(event.sender.send).toHaveBeenCalledTimes(1);
    expect(event.sender.send).toHaveBeenCalledWith('study-response', {
      progress: 0,
      state: State.Loading,
      result: [],
    });
  });

  test('reports a missing configuration for test requests', async () => {
    await channel.handle(event, {
      method: 'test',
      query: {
        form: {
          config: null,
        },
      },
    });

    expect(dialog.showOpenDialog).not.toHaveBeenCalled();
    expect(event.sender.send).toHaveBeenLastCalledWith(
      'pupillometry_response',
      {
        progress: 0,
        state: State.Error,
        result: [],
        error: 'No configuration selected',
      }
    );
  });
});
