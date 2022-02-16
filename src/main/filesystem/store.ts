/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import Store from 'electron-store';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import fs from 'fs';
import { removeElement } from '../../util';
import { IMessage } from '../../ipc/types';
import { Channel, State } from '../../ipc/channels';
import { processPupilSamples } from '../pupillary/process';

import configJSON from '../pupillary/config.json';
import saveMetrics from './saveMetrics';

const DEFAULT_CONFIG = configJSON as IConfig;

Store.initRenderer();

enum StoreKey {
  Studies = 'studies',
  Recent = 'recent',
  Configs = 'configs',
}

class DB {
  private store: Store<IStore>;

  private mainWindow: BrowserWindow;

  private assetsPath: string;

  constructor(mainWindow: BrowserWindow, assetsPath: string) {
    // still same store
    this.store = new Store<IStore>();
    this.mainWindow = mainWindow;
    this.assetsPath = assetsPath;
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
      (event: Electron.IpcMainInvokeEvent, data: IDeleteStudy) => {
        const studies = this.store.get(StoreKey.Studies);
        removeElement(studies, 'name', data.studyName);
        this.store.set(StoreKey.Studies, studies);
        const dir = `${this.assetsPath}/data/${data.studyName}`;
        fs.rmdirSync(dir, { recursive: true });
      }
    );

    ipcMain.on(
      Channel.DeleteGroup,
      (event: Electron.IpcMainInvokeEvent, data: IDeleteGroup) => {
        const { studyName, groupName } = data;
        const studies = this.store.get(StoreKey.Studies);
        const study = studies.find((s) => s.name === studyName);
        if (!study) return;
        removeElement(study.groups, 'name', groupName);
        this.store.set(StoreKey.Studies, studies);
        const dir = `${this.assetsPath}/data/${studyName}/${groupName}`;
        fs.rmdirSync(dir, { recursive: true });
      }
    );

    ipcMain.on(
      Channel.DeleteRespondent,
      (event: Electron.IpcMainInvokeEvent, data: IDeleteRespondent) => {
        const { studyName, groupName, respondentName } = data;
        const studies = this.store.get(StoreKey.Studies);
        const study = studies.find((s) => s.name === studyName);
        if (!study) return;
        const group = study.groups.find((g) => g.name === groupName);
        if (!group) return;
        removeElement(group.respondents, 'name', respondentName);
        this.store.set(StoreKey.Studies, studies);
        const filePath = `${this.assetsPath}/data/${studyName}/${groupName}/${respondentName}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            // console.error(err);
          }
          // file removed
        });
      }
    );

    ipcMain.on(
      Channel.Request,
      async (
        event: Electron.IpcMainEvent,
        data: { responseChannel: Channel; form: IRequestForm }
      ) => {
        const { responseChannel, form } = data;
        const message: IMessage = {
          state: State.Loading,
          response: null,
          progress: 0,
        };
        event.sender.send(responseChannel, message);
        console.log('CHANNEL', responseChannel);
        switch (responseChannel) {
          case Channel.GetStudies:
            message.response = this.store.get(StoreKey.Studies) ?? [];
            message.progress = 1;
            message.state = State.Done;
            break;
          case Channel.GetStudy:
            {
              const studies = this.store.get(StoreKey.Studies);
              const study = studies.find(
                (s: IStudy) => s.name === form.studyName
              );

              message.response = study;
              message.state = State.Done;
              message.progress = 1;
            }
            break;
          case Channel.CreateStudy:
            {
              const studies = this.store.get(StoreKey.Studies) ?? [];
              if (!form.studyName) return;
              studies.push({ name: form.studyName, groups: [] });
              this.store.set(StoreKey.Studies, studies);
              const dataFolder = `${this.assetsPath}/data`;
              const studyFolder = `${this.assetsPath}/data/${form.studyName}`;

              if (!fs.existsSync(dataFolder)) {
                fs.mkdirSync(dataFolder);
              }
              if (!fs.existsSync(studyFolder)) {
                fs.mkdirSync(studyFolder);
              }
              message.state = State.Done;
              message.progress = 1;
              message.response = State.Done;
            }
            break;
          case Channel.CreateGroup:
            {
              const studies = this.store.get(StoreKey.Studies);
              const study = studies.find(
                (s: IStudy) => s.name === form.studyName
              );
              if (!study) throw new Error('Study does not exist');
              if (!study.groups) study.groups = [];
              if (!form.groupName) throw new Error('Group name is unknown');
              if (form.isDependant === undefined)
                throw new Error('isDependant is unknown');
              if (!form.config) throw new Error('Config is unknown');
              const { files } = form;
              if (!files) throw new Error('No files');
              const respondents: IRespondentSamples[] = [];
              const allConfigs = this.store.get(StoreKey.Configs);
              const config = allConfigs?.[form.config.name] ?? DEFAULT_CONFIG;
              const groupFolder = `${this.assetsPath}/data/${study.name}/${form.groupName}`;
              if (!fs.existsSync(groupFolder)) {
                fs.mkdirSync(groupFolder);
              }
              let i = 0;
              for (const file of files) {
                i += 1;
                const res = await processPupilSamples(file.path, config);
                const dataPath = `${groupFolder}/${res.name}`;
                fs.writeFile(dataPath, JSON.stringify(res), (err) => {
                  if (err) return console.log(err);
                  return 0;
                });
                res.dataPath = dataPath;
                res.segments.map((s) => {
                  s.validSamples = [];
                  return s;
                });
                respondents.push(res);
                message.progress = i / files.length;
                message.state = State.Loading;
                event.sender.send(responseChannel, message);
              }
              const group = {
                name: form.groupName,
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
              const study = studies.find(
                (s: IStudy) => s.name === form.studyName
              );
              if (!study) throw new Error('Study does not exist');
              if (!study.groups) study.groups = [];
              const group = study.groups.find((g) => g.name === form.groupName);
              if (!group) return;
              const { files } = form;
              if (!files) return;
              if (!form.config) return;
              const allConfigs = this.store.get(StoreKey.Configs);
              const config = allConfigs?.[form.config.name] ?? DEFAULT_CONFIG;
              let i = 0;
              const groupFolder = `${this.assetsPath}/data/${study.name}/${form.groupName}`;
              for (const file of files) {
                i += 1;
                const res = await processPupilSamples(file.path, config);
                const dataPath = `${groupFolder}/${res.name}`;
                fs.writeFile(dataPath, JSON.stringify(res), (err) => {
                  if (err) return console.log(err);
                  return 0;
                });
                res.dataPath = dataPath;
                res.segments.map((s) => {
                  s.validSamples = [];
                  return s;
                });
                group.respondents.push(res);
                message.progress = i / files.length;
                message.state = State.Loading;
                event.sender.send(responseChannel, message);
              }
              message.response = group;
              this.store.set(StoreKey.Studies, studies);
              message.state = State.Done;
              message.progress = 1;
            }
            break;
          case Channel.GetRespondentPupilData:
            {
              const { studyName, groupName, respondentName } = form;
              const filePath = `${this.assetsPath}/data/${studyName}/${groupName}/${respondentName}`;
              if (!fs.existsSync(filePath)) {
                message.state = State.Done;
                return;
              }
              const d = fs.readFileSync(filePath, 'utf8');
              message.response = JSON.parse(d);
              message.progress = 1;
              message.state = State.Done;
            }
            break;
          case Channel.GetConfigs:
            {
              const configs = this.store.get(StoreKey.Configs) ?? {};
              configs.default = DEFAULT_CONFIG;
              message.state = State.Done;
              message.progress = 1;
              message.response = configs;
            }
            break;
          case Channel.CreateConfig:
            {
              const configs = this.store.get(StoreKey.Configs) ?? {};
              if (!form.config) return;
              configs[form.config.name] = form.config;
              this.store.set(StoreKey.Configs, configs);
              message.state = State.Done;
              message.progress = 1;
              message.response = State.Done;
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
      const dir = `${this.assetsPath}/data`;
      fs.rmdirSync(dir, { recursive: true });
    });
  }
}

export default DB;
