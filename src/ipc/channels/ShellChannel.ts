import { IpcMainEvent, shell } from 'electron';
import { ChannelNames, IpcChannel, IpcRequest } from '../interfaces';

export interface IShellRequest extends IpcRequest {
  method: 'open';
  options?: {
    href?: string;
  };
}

export default class ShellChannel implements IpcChannel {
  private name = ChannelNames.SHELL;

  getName(): string {
    return this.name;
  }

  async handle(_: IpcMainEvent, request: IShellRequest): Promise<void> {
    if (!request.responseChannel) {
      request.responseChannel = `${this.getName()}_response`;
    }
    // Process
    const { options, method } = request;
    if (method === 'open') {
      if (!options?.href) return;
      await shell.openExternal(options.href);
    }
  }
}
