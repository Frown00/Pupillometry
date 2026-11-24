/* eslint-disable no-restricted-syntax */
import { BrowserWindow, dialog, ipcMain, IpcMainEvent, shell } from 'electron';
import ExportFasade from '../../main/pupillary/export';
import PupillometryRepository, {
  IPupillometryQuery,
} from '../../main/store/repository/PupillometryRepository';
import { ChannelNames, IpcChannel, IpcRequest, State } from '../interfaces';

export interface IPupillometryRequest extends IpcRequest {
  method: 'test' | 'process' | 'export' | 'export-samples';
  query: IPupillometryQuery;
  internal?: boolean;
}

export interface IPupillometryResponse {
  state: State;
  progress: number;
  result: IPupillometryResult[];
  error?: string;
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
    const { query, method, responseChannel, internal } = request;
    const { files = [], config = null } = query.form ?? {};
    const saveCallback = (res: IPupillometryResponse) => {
      if (internal) {
        ipcMain.emit(responseChannel, event, res);
      } else {
        event.sender.send(responseChannel, res);
      }
    };

    if (method === 'test') {
      if (!config) {
        event.sender.send(request.responseChannel, {
          ...response,
          state: State.Error,
          error: 'No configuration selected',
        });
        return;
      }
      const result = await dialog
        .showOpenDialog(this.mainWindow, {
          buttonLabel: 'Select a pupillometry file',
          properties: ['multiSelections', 'createDirectory', 'openFile'],
        })
        .then(async (r: Electron.OpenDialogReturnValue) => {
          if (r.canceled || r.filePaths.length === 0) return null;
          const path = r.filePaths[0];
          const data = await PupillometryRepository.test(
            [path],
            config,
            () => null
          );
          return data[0];
        })
        .catch((err) => {
          event.sender.send(request.responseChannel, {
            ...response,
            state: State.Error,
            error: `Cannot read the selected file: ${err.message ?? err}`,
          });
          return null;
        });
      if (!result) return;
      event.sender.send(request.responseChannel, {
        ...response,
        result: [result],
        progress: 1,
        state: State.Done,
      });
    }

    if (method === 'process') {
      if (!config) {
        saveCallback({
          ...response,
          state: State.Error,
          error: 'No configuration selected',
        });
        return;
      }
      const paths = files?.map((f) => f.path) ?? [];
      try {
        const data = await PupillometryRepository.process(
          paths,
          config,
          saveCallback
        );
        saveCallback({
          ...response,
          result: data,
          progress: 1,
          state: State.Done,
        });
      } catch (err: any) {
        saveCallback({
          ...response,
          state: State.Error,
          error: `Cannot process the selected files: ${err.message ?? err}`,
        });
      }
    }

    if (method === 'export') {
      const { study, taskGroups } = query?.export ?? {};
      if (!study) throw new Error('No study');
      if (!taskGroups) throw new Error('No task groups');

      const dir = await ExportFasade.saveGroupedMetrics(study, taskGroups);
      if (dir) {
        shell.openPath(dir);
      }
    }

    if (method === 'export-samples') {
      const { study } = query?.export ?? {};
      if (!study) throw new Error('No study');
      const dir = await ExportFasade.saveSamples(study);
      if (dir) {
        shell.openPath(dir);
      }
    }
  }
}
