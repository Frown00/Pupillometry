import { ipcMain } from 'electron';
import type { BrowserWindow, IpcMainEvent } from 'electron';
import { ChannelNames, State } from '../interfaces';
import type { IPupillometryRequest } from '../channels/PupillometryChannel';
import { registerIpcChannels } from '../index';

jest.mock('electron', () => {
  const { EventEmitter } = jest.requireActual('events');
  return {
    BrowserWindow: jest.fn(),
    dialog: {
      showOpenDialog: jest.fn(),
    },
    ipcMain: new EventEmitter(),
    shell: {
      openExternal: jest.fn(),
      openPath: jest.fn(),
    },
  };
});

describe('registerIpcChannels', () => {
  beforeEach(() => {
    ipcMain.removeAllListeners();
  });

  test('sends an error response when an async channel handler rejects', async () => {
    const sender = { send: jest.fn() };
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
