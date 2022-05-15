/* eslint-disable import/prefer-default-export */
import { BrowserWindow, ipcMain } from 'electron';
import ConfigChannel from './channels/ConfigChannel';
import PupillometryChannel from './channels/PupillometryChannel';
import ShellChannel from './channels/ShellChannel';
import StudyChannel from './channels/StudyChannel';
import { IpcChannel } from './interfaces';

export function registerIpcChannels(mainWindow: BrowserWindow) {
  const ipcChannel: IpcChannel[] = [
    new StudyChannel(),
    new ConfigChannel(),
    new PupillometryChannel(mainWindow),
    new ShellChannel(),
  ];
  ipcChannel.forEach((channel) =>
    ipcMain.on(channel.getName(), (event, request) =>
      channel.handle(event, request)
    )
  );
}
