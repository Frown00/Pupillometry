import { IpcRenderer } from 'electron';
import { Channel, IpcRequest } from '../ipc/interfaces';

export default class IpcService {
  private static ipcRenderer?: IpcRenderer;

  private constructor() {
    //
  }

  static send(channel: Channel, request: IpcRequest): string {
    // If the ipcRenderer is not available try to initialize it
    if (!IpcService.ipcRenderer) {
      IpcService.initializeIpcRenderer();
    }
    // If there's no responseChannel let's auto-generate it
    if (!request.responseChannel) {
      request.responseChannel = `${channel}_response_${new Date().getTime()}`;
    }
    const { ipcRenderer } = IpcService;
    if (!ipcRenderer) {
      throw new Error('No ipcRenderer connected');
    }
    ipcRenderer.send(channel, request);
    // This method returns a promise which will be resolved when the response has arrived.
    return request.responseChannel;
  }

  static receive<T>(channel: string): Promise<T> {
    const { ipcRenderer, initializeIpcRenderer } = IpcService;
    if (!ipcRenderer) {
      initializeIpcRenderer();
    }
    if (!ipcRenderer) {
      throw new Error('No ipcRenderer connected');
    }
    return new Promise((resolve) => {
      ipcRenderer.once(channel, (_, response) => resolve(response));
    });
  }

  static on(
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) {
    const { ipcRenderer, initializeIpcRenderer } = IpcService;
    if (!ipcRenderer) {
      initializeIpcRenderer();
    }
    IpcService.ipcRenderer?.on(channel, listener);
  }

  static removeAllListeners(channel: string) {
    const { ipcRenderer, initializeIpcRenderer } = IpcService;
    if (!ipcRenderer) {
      initializeIpcRenderer();
    }
    IpcService.ipcRenderer?.removeAllListeners(channel);
  }

  private static initializeIpcRenderer() {
    if (!window) {
      throw new Error(`Unable to require renderer process`);
    }
    IpcService.ipcRenderer = (<any>window).api.ipcRenderer;
  }
}
