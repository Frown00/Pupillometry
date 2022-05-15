import { IpcMainEvent } from 'electron';

export interface IpcRequest {
  responseChannel?: string;
  params?: string[];
}

export interface IpcChannel {
  getName(): string;
  handle(event: IpcMainEvent, request: IpcRequest): void;
}

export const ChannelNames = {
  STUDY: 'study',
  CONFIG: 'config',
  PUPILLOMETRY: 'pupillometry',
  SESSION: 'session',
  SHELL: 'shell',
} as const;

export type Channel = 'study' | 'config' | 'pupillometry' | 'session' | 'shell';

export enum State {
  Loading = 'loading',
  Done = 'done',
}
