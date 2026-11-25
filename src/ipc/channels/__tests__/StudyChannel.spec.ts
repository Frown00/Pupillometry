import { ipcMain } from 'electron';
import FileStore from '../../../main/store/FileStore';
import ConfigRepository from '../../../main/store/repository/ConfigRepository';
import StudyRepository from '../../../main/store/repository/StudyRepository';
import { ChannelNames, State } from '../../interfaces';
import StudyChannel, { IStudyRequest } from '../StudyChannel';

jest.mock('electron', () => {
  const { EventEmitter } = jest.requireActual('events');
  return {
    ipcMain: new EventEmitter(),
  };
});

jest.mock('../../../main/store/FileStore', () => ({
  __esModule: true,
  default: {
    getDataFolder: jest.fn(),
    saveFile: jest.fn(),
  },
}));

jest.mock('../../../main/store/repository/ConfigRepository', () => ({
  __esModule: true,
  default: {
    readOne: jest.fn(),
  },
}));

jest.mock('../../../main/store/repository/StudyRepository', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    readAll: jest.fn(),
    readOne: jest.fn(),
  },
}));

const config = { name: 'test config' } as IConfig;
const group: IGroup = {
  name: 'control',
  isDependant: false,
  respondents: [],
};
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
const channel = new StudyChannel();

describe('StudyChannel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ipcMain.removeAllListeners();
  });

  test('sends a successful response for read requests', () => {
    jest.mocked(StudyRepository.readAll).mockReturnValue([group]);

    channel.handle(event, {
      method: 'readAll',
      responseChannel: 'study-response',
      query: { select: 'group', name: 'study' },
    });

    expect(event.sender.send).toHaveBeenNthCalledWith(1, 'study-response', {
      progress: 0,
      state: State.Loading,
      result: null,
    });
    expect(event.sender.send).toHaveBeenLastCalledWith('study-response', {
      progress: 1,
      state: State.Done,
      result: [group],
    });
  });

  test('sends an error response when a repository operation throws', () => {
    jest
      .mocked(StudyRepository.readAll)
      .mockImplementation(() => {
        throw new Error('store unavailable');
      });

    channel.handle(event, {
      method: 'readAll',
      responseChannel: 'study-response',
      query: { select: 'group', name: 'study' },
    });

    expect(event.sender.send).toHaveBeenLastCalledWith('study-response', {
      progress: 0,
      state: State.Error,
      result: null,
      error: 'store unavailable',
    });
  });

  test('forwards processing progress and removes its listener after completion', () => {
    const processRequest: IStudyRequest = {
      method: 'create',
      responseChannel: 'study-response',
      query: {
        select: 'respondent',
        name: 'study',
        group: group.name,
        form: {
          config,
          files: [
            { path: '/data/first.csv' },
            { path: '/data/second.csv' },
          ],
        },
      },
    };
    const processListener = jest.fn();
    ipcMain.on(ChannelNames.PUPILLOMETRY, processListener);
    jest.mocked(ConfigRepository.readOne).mockReturnValue(config);
    jest.mocked(StudyRepository.readOne).mockReturnValue(group);
    jest.mocked(FileStore.getDataFolder).mockReturnValue('/data/study/control');
    jest
      .mocked(FileStore.saveFile)
      .mockImplementation((savedResult) => `/data/${savedResult.name}`);

    channel.handle(event, processRequest);

    expect(processListener).toHaveBeenCalledWith(
      event,
      expect.objectContaining({
        method: 'process',
        responseChannel: 'study-response',
        internal: true,
      })
    );
    expect(ipcMain.listenerCount('study-response')).toBe(1);

    ipcMain.emit('study-response', event, {
      result: [result],
      state: State.Loading,
      progress: 0,
    });
    ipcMain.emit('study-response', event, {
      result: [result],
      state: State.Loading,
      progress: 0,
    });

    expect(event.sender.send).toHaveBeenNthCalledWith(
      2,
      'study-response',
      expect.objectContaining({ state: State.Loading, progress: 0.5 })
    );
    expect(event.sender.send).toHaveBeenNthCalledWith(
      3,
      'study-response',
      expect.objectContaining({ state: State.Loading, progress: 1 })
    );

    ipcMain.emit('study-response', event, {
      result: [result],
      state: State.Done,
      progress: 1,
    });

    expect(StudyRepository.create).toHaveBeenCalledWith({
      name: 'study',
      group: group.name,
      select: 'respondent',
      results: [result],
      form: { config },
    });
    expect(event.sender.send).toHaveBeenLastCalledWith('study-response', {
      result: group,
      state: State.Done,
      progress: 1,
    });
    expect(ipcMain.listenerCount('study-response')).toBe(0);
  });

  test('forwards processing errors and removes its listener', () => {
    jest.mocked(ConfigRepository.readOne).mockReturnValue(config);
    jest.mocked(StudyRepository.readOne).mockReturnValue(group);
    jest.mocked(FileStore.getDataFolder).mockReturnValue('/data/study/control');

    channel.handle(event, {
      method: 'create',
      responseChannel: 'study-response',
      query: {
        select: 'respondent',
        name: 'study',
        group: group.name,
        form: {
          config,
          files: [{ path: '/data/respondent.csv' }],
        },
      },
    });

    ipcMain.emit('study-response', event, {
      result: [],
      state: State.Error,
      progress: 0,
      error: 'processing failed',
    });

    expect(event.sender.send).toHaveBeenLastCalledWith('study-response', {
      result: [],
      state: State.Error,
      progress: 0,
      error: 'processing failed',
    });
    expect(ipcMain.listenerCount('study-response')).toBe(0);
  });
});
