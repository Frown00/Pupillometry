/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import Store from 'electron-store';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { removeElement } from '../../util';
import { IMessage } from '../../ipc/types';
import { Channel, State } from '../../ipc/channels';
import { processPupilSamples } from '../pupillary/process';

import * as configJSON from '../pupillary/config.json';
import saveMetrics from './saveMetrics';

const DEFAULT_CONFIG = configJSON as IConfig;

Store.initRenderer();

enum StoreKey {
  StudyAnnotations = 'studyAnnotations',
  Studies = 'studies',
  Recent = 'recent',
}

class DB {
  private store: Store<IStore>;

  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    // still same store
    this.store = new Store<IStore>();
    this.mainWindow = mainWindow;
  }

  private getStudy(name: string) {
    return this.store.get(StoreKey.Studies).find((s) => s.name === name);
  }

  listenEvents(): void {
    ipcMain.handle(
      Channel.GetStoreValue,
      (event: Electron.IpcMainInvokeEvent, key) => {
        return this.store.get(key);
      }
    );

    ipcMain.on(
      Channel.SetStoreValue,
      (
        event: Electron.IpcMainInvokeEvent,
        data: { key: string; value: any }
      ) => {
        return this.store.set(data.key, data.value);
      }
    );

    ipcMain.on(
      Channel.DeleteStudy,
      (event: Electron.IpcMainInvokeEvent, data: { name: string }) => {
        const studies = this.store.get(StoreKey.Studies);
        const annotations = this.store.get(StoreKey.StudyAnnotations);
        removeElement(studies, 'name', data.name);
        removeElement(annotations, 'name', data.name);
        this.store.set(StoreKey.Studies, studies);
        this.store.set(StoreKey.StudyAnnotations, annotations);
      }
    );

    ipcMain.on(
      Channel.DeleteGroup,
      (
        event: Electron.IpcMainInvokeEvent,
        data: { studyName: string; groupName: string }
      ) => {
        const { studyName, groupName } = data;
        const studies = this.store.get(StoreKey.Studies);
        const study = studies.find((s) => s.name === studyName);
        if (!study) return;
        removeElement(study.groups, 'name', groupName);
        this.store.set(StoreKey.Studies, studies);
      }
    );

    ipcMain.on(
      Channel.DeleteRespondent,
      (
        event: Electron.IpcMainInvokeEvent,
        data: { studyName: string; groupName: string; respondentName: string }
      ) => {
        const { studyName, groupName, respondentName } = data;
        const studies = this.store.get(StoreKey.Studies);
        const study = studies.find((s) => s.name === studyName);
        if (!study) return;
        const group = study.groups.find((g) => g.name === groupName);
        if (!group) return;
        removeElement(group.respondents, 'name', respondentName);
        this.store.set(StoreKey.Studies, studies);
      }
    );

    ipcMain.on(
      Channel.Request,
      async (
        event: Electron.IpcMainEvent,
        data: { responseChannel: Channel; form: any }
      ) => {
        const { responseChannel, form } = data;
        const message: IMessage = {
          state: State.Loading,
          response: null,
          progress: 0,
        };
        event.sender.send(responseChannel, message);
        switch (responseChannel) {
          case Channel.GetStudyAnnotations:
            message.response = this.store.get(StoreKey.StudyAnnotations) ?? [];
            message.progress = 1;
            message.state = State.Done;
            break;
          case Channel.GetStudy:
            {
              const studies = this.store.get(StoreKey.Studies);
              const study = studies.find((s: IStudy) => s.name === form.study);
              message.response = study;
              message.state = State.Done;
              message.progress = 1;
            }
            break;
          case Channel.CreateStudy:
            {
              const annotations =
                this.store.get(StoreKey.StudyAnnotations) ?? [];
              const studies = this.store.get(StoreKey.Studies) ?? [];
              annotations.push({ name: form.name });
              studies.push(form);
              this.store.set(StoreKey.StudyAnnotations, annotations);
              this.store.set(StoreKey.Studies, studies);
              message.state = State.Done;
              message.progress = 1;
              message.response = State.Done;
            }
            break;
          case Channel.CreateGroup:
            {
              const studies = this.store.get(StoreKey.Studies);
              const study = studies.find((s: IStudy) => s.name === form.study);
              if (!study) throw new Error('Study does not exist');
              if (!study.groups) study.groups = [];

              const { files } = form;
              const respondents: IRespondentSamples[] = [];
              let i = 0;
              for (const file of files) {
                i += 1;
                const res = await processPupilSamples(
                  file.path,
                  DEFAULT_CONFIG
                );
                respondents.push(res);
                message.progress = i / files.length;
                message.state = State.Loading;
                event.sender.send(responseChannel, message);
              }
              const group = {
                name: form.name,
                isDependant: form.isDependant,
                respondents,
              };
              study.groups.push(group);
              this.store.set(StoreKey.Studies, studies);
              message.state = State.Done;
              message.progress = 1;
              message.response = group;
            }
            break;
          case Channel.AddRespondent:
            {
              const studies = this.store.get(StoreKey.Studies);
              const study = studies.find((s: IStudy) => s.name === form.study);
              if (!study) throw new Error('Study does not exist');
              if (!study.groups) study.groups = [];
              const group = study.groups.find((g) => g.name === form.groupName);
              if (!group) return;
              const { files } = form;
              let i = 0;
              for (const file of files) {
                i += 1;
                const res = await processPupilSamples(
                  file.path,
                  DEFAULT_CONFIG
                );
                group.respondents.push(res);
                message.response = res;
                message.progress = i / files.length;
                message.state = State.Loading;
                event.sender.send(responseChannel, message);
              }

              this.store.set(StoreKey.Studies, studies);
              message.state = State.Done;
              message.progress = 1;
            }
            break;
          default:
            throw new Error('Wrong channel has been passed');
        }
        event.sender.send(responseChannel, message);
      }
    );

    ipcMain.on(
      Channel.ExportMetrics,
      (e: Electron.IpcMainInvokeEvent, message: { name: string }) => {
        console.log('Export metrics', message.name);

        try {
          // eslint-disable-next-line promise/catch-or-return
          dialog
            .showOpenDialog(this.mainWindow, {
              title: 'Select location to save pupillometry metrics',
              buttonLabel: 'Select',
              properties: ['openDirectory'],
            })
            .then(async (result: Electron.OpenDialogReturnValue) => {
              const directoryPath = result.filePaths[0];
              const study = this.getStudy(message.name);
              const dir = await saveMetrics(directoryPath, study);
              if (dir) {
                shell.openPath(dir);
              }
              return result;
            });
        } catch (err) {
          throw new Error();
        }
      }
    );

    ipcMain.on(Channel.ClearDB, (e, data) => {
      console.log(e, data);
      this.store.clear();
    });
  }
}

export default DB;
