import type { IpcRequest, IpcResponseMessage } from './interfaces';

export interface IIpcRendererApi {
  send(channel: string, value: IpcRequest): void;
  on(
    channel: string,
    listener: (
      event: Electron.IpcRendererEvent,
      response: IpcResponseMessage
    ) => void
  ): void;
  once(
    channel: string,
    listener: (
      event: Electron.IpcRendererEvent,
      response: IpcResponseMessage
    ) => void
  ): void;
  removeAllListeners(channel: string): void;
  removeEventListener(
    channel: string,
    listener: (
      event: Electron.IpcRendererEvent,
      response: IpcResponseMessage
    ) => void
  ): void;
}

declare global {
  interface Window {
    api: {
      ipcRenderer: IIpcRendererApi;
    };
  }
}
