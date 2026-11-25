/* eslint-disable import/prefer-default-export */
import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import ConfigChannel from './channels/ConfigChannel';
import PupillometryChannel from './channels/PupillometryChannel';
import ShellChannel from './channels/ShellChannel';
import StudyChannel from './channels/StudyChannel';
import { IpcChannel, IpcRequest, State } from './interfaces';

export function registerIpcChannels(mainWindow: BrowserWindow) {
  const ipcChannel: IpcChannel[] = [
    new StudyChannel(),
    new ConfigChannel(),
    new PupillometryChannel(mainWindow),
    new ShellChannel(),
  ];
  ipcChannel.forEach((channel) => {
    ipcMain.on(channel.getName(), (event, request: IpcRequest) => {
      const handleError = (error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (request?.responseChannel) {
          event.sender.send(request.responseChannel, {
            state: State.Error,
            progress: 0,
            result: null,
            error: errorMessage,
          });
        } else {
          log.error('IPC channel failed without a response channel', error);
        }
      };

      try {
        const result = channel.handle(event, request);
        if (result instanceof Promise) {
          void result.catch(handleError);
        }
      } catch (error) {
        handleError(error);
      }
    });
  });
}
