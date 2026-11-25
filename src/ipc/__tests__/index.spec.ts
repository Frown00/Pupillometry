import { ipcMain } from 'electron';
import type { BrowserWindow, IpcMainEvent } from 'electron';
import { vi } from 'vitest';
import { ChannelNames, State } from '../interfaces';
import type { IPupillometryRequest } from '../channels/PupillometryChannel';
import { registerIpcChannels } from '../index';

vi.mock('electron', async () => {
  const { EventEmitter } =
    await vi.importActual<typeof import('events')>('events');
  return {
    BrowserWindow: vi.fn(),
    dialog: {
      showOpenDialog: vi.fn(),
    },
    ipcMain: new EventEmitter(),
    shell: {
      openExternal: vi.fn(),
      openPath: vi.fn(),
    },
  };
});

vi.mock('../channels/ConfigChannel', () => ({
  default: class {
    getName() {
      return 'config';
    }

    handle() {
      return undefined;
    }
  },
}));

vi.mock('../channels/PupillometryChannel', () => ({
  default: class {
    getName() {
      return 'pupillometry';
    }

    handle() {
      return Promise.reject(new Error('No study'));
    }
  },
}));

vi.mock('../channels/ShellChannel', () => ({
  default: class {
    getName() {
      return 'shell';
    }

    handle() {
      return undefined;
    }
  },
}));

vi.mock('../channels/StudyChannel', () => ({
  default: class {
    getName() {
      return 'study';
    }

    handle() {
      return undefined;
    }
  },
}));

describe('registerIpcChannels', () => {
  beforeEach(() => {
    ipcMain.removeAllListeners();
  });

  test('sends an error response when an async channel handler rejects', async () => {
    const sender = { send: vi.fn() };
    const event = { sender } as unknown as IpcMainEvent;
    const request = {
      responseChannel: 'pupillometry_response',
      method: 'export',
      query: {},
    } as IPupillometryRequest;

    registerIpcChannels({} as BrowserWindow);

    const handler = ipcMain.listeners(ChannelNames.PUPILLOMETRY)[0] as (
      event: IpcMainEvent,
      request: IPupillometryRequest
    ) => void;
    handler(event, request);
    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(sender.send).toHaveBeenLastCalledWith('pupillometry_response', {
      state: State.Error,
      progress: 0,
      result: null,
      error: 'No study',
    });
  });
});
