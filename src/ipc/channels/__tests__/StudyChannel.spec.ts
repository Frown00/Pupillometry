import { ipcMain } from 'electron';
import { vi } from 'vitest';
import FileStore from '../../../main/store/FileStore';
import ConfigRepository from '../../../main/store/repository/ConfigRepository';
import StudyRepository from '../../../main/store/repository/StudyRepository';
import { ChannelNames, State } from '../../interfaces';
import StudyChannel, { IStudyRequest } from '../StudyChannel';

vi.mock('electron', async () => {
  const { EventEmitter } =
    await vi.importActual<typeof import('events')>('events');
  return {
    ipcMain: new EventEmitter(),
  };
});

vi.mock('../../../main/store/FileStore', () => ({
  __esModule: true,
  default: {
    getDataFolder: vi.fn(),
    saveFile: vi.fn(),
  },
}));

vi.mock('../../../main/store/repository/ConfigRepository', () => ({
  __esModule: true,
  default: {
    readOne: vi.fn(),
  },
}));

vi.mock('../../../main/store/repository/StudyRepository', () => ({
  __esModule: true,
  default: {
    create: vi.fn(),
    readAll: vi.fn(),
    readOne: vi.fn(),
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
    send: vi.fn(),
  },
} as unknown as Electron.IpcMainEvent;
const channel = new StudyChannel();

describe('StudyChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ipcMain.removeAllListeners();
  });

  test('sends a successful response for read requests', () => {
    vi.mocked(StudyRepository.readAll).mockReturnValue([group]);

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
    vi.mocked(StudyRepository.readAll).mockImplementation(() => {
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
          files: [{ path: '/data/first.csv' }, { path: '/data/second.csv' }],
        },
      },
    };
    const processListener = vi.fn();
    ipcMain.on(ChannelNames.PUPILLOMETRY, processListener);
    vi.mocked(ConfigRepository.readOne).mockReturnValue(config);
    vi.mocked(StudyRepository.readOne).mockReturnValue(group);
    vi.mocked(FileStore.getDataFolder).mockReturnValue('/data/study/control');
    vi
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
    vi.mocked(ConfigRepository.readOne).mockReturnValue(config);
    vi.mocked(StudyRepository.readOne).mockReturnValue(group);
    vi.mocked(FileStore.getDataFolder).mockReturnValue('/data/study/control');

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
