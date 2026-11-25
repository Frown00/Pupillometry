import type {
  Channel,
  IpcRequest,
  IpcResponseMessage,
} from '../ipc/interfaces';
import type { IIpcRendererApi } from '../ipc/types';

export default class IpcService {
  private static ipcRenderer?: IIpcRendererApi;

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

  static receive<T extends IpcResponseMessage>(channel: string): Promise<T> {
    const { ipcRenderer, initializeIpcRenderer } = IpcService;
    if (!ipcRenderer) {
      initializeIpcRenderer();
    }
    if (!ipcRenderer) {
      throw new Error('No ipcRenderer connected');
    }
    return new Promise((resolve) => {
      ipcRenderer.once(channel, (_, response) => resolve(response as T));
    });
  }

  static on<T extends IpcResponseMessage>(
    channel: string,
    listener: (event: Electron.IpcRendererEvent, response: T) => void
  ) {
    const { ipcRenderer, initializeIpcRenderer } = IpcService;
    if (!ipcRenderer) {
      initializeIpcRenderer();
    }
    IpcService.ipcRenderer?.on(channel, (event, response) => {
      listener(event, response as T);
    });
  }

  static removeAllListeners(channel: string) {
    const { ipcRenderer, initializeIpcRenderer } = IpcService;
    if (!ipcRenderer) {
      initializeIpcRenderer();
    }
    IpcService.ipcRenderer?.removeAllListeners(channel);
  }

  private static initializeIpcRenderer() {
    if (typeof window === 'undefined') {
      throw new Error(`Unable to require renderer process`);
    }
    IpcService.ipcRenderer = window.api.ipcRenderer;
  }
}
