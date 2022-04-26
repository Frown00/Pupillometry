/* eslint-disable no-restricted-syntax */
import { BrowserWindow, dialog, ipcMain, IpcMainEvent } from 'electron';
import PupillometryRepository, {
  IPupillometryQuery,
} from '../../main/store/repository/PupillometryRepository';
import { ChannelNames, IpcChannel, IpcRequest, State } from '../interfaces';

export interface IPupillometryRequest extends IpcRequest {
  method: 'test' | 'process';
  query: IPupillometryQuery;
}

export interface IPupillometryResponse {
  state: State;
  progress: number;
  result: IPupillometryResult[];
}

export default class PupillometryChannel implements IpcChannel {
  private name = ChannelNames.PUPILLOMETRY;

  private mainWindow: BrowserWindow;

  constructor(window: BrowserWindow) {
    this.mainWindow = window;
  }

  getName(): string {
    return this.name;
  }

  async handle(
    event: IpcMainEvent,
    request: IPupillometryRequest
  ): Promise<void> {
    if (!request.responseChannel) {
      request.responseChannel = `${this.getName()}_response`;
    }
    const response: IPupillometryResponse = {
      progress: 0,
      state: State.Loading,
      result: [],
    };
    event.sender.send(request.responseChannel, response);
    // Process
    const { query, method, responseChannel } = request;
    const { files, config } = query.form;
    const saveCallback = (res: IPupillometryResponse) => {
      ipcMain.emit(responseChannel, event, res);
    };

    if (method === 'test') {
      const result = await dialog
        .showOpenDialog(this.mainWindow, {
          buttonLabel: 'Select a pupillometry file',
          properties: ['multiSelections', 'createDirectory', 'openFile'],
        })
        .then(async (r: Electron.OpenDialogReturnValue) => {
          const path = r.filePaths[0];
          const data = await PupillometryRepository.test(
            [path],
            config,
            () => null
          );
          return data[0];
        })
        .catch((err) => {
          throw new Error(`Error while selecting file: ${err.stack}`);
        });
      response.result = [result];
      event.sender.send(request.responseChannel, {
        ...response,
        progress: 1,
        state: State.Done,
      });
    }

    if (method === 'process') {
      const paths = files?.map((f) => f.path) ?? [];
      const data = await PupillometryRepository.process(
        paths,
        config,
        saveCallback
      );
      response.result = data;
      saveCallback({ ...response, progress: 1, state: State.Done });
    }
  }
}
