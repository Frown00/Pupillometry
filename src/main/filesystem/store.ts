/* eslint-disable no-await-in-loop */
import Store from 'electron-store';
import { ipcMain } from 'electron';
import { removeElement } from '../../util';
import { IMessage } from '../../ipc/types';
import { Channel, State } from '../../ipc/channels';
import { processPupilSamples } from '../pupillary/process';
import * as configJSON from '../pupillary/config.json';

const DEFAULT_CONFIG = configJSON as IConfig;

Store.initRenderer();

enum StoreKey {
  StudyAnnotations = 'studyAnnotations',
  Studies = 'studies',
  Recent = 'recent',
}

class DB {
  private store: Store<IStore>;

  constructor() {
    // still same store
    this.store = new Store<IStore>();
  }

  listenEvents(): void {
    ipcMain.handle(Channel.GetStoreValue, (event: any, key) => {
      console.log(key);
      return this.store.get(key);
    });

    ipcMain.on(
      Channel.SetStoreValue,
      (event: any, data: { key: string; value: any }) => {
        console.log(data);
        return this.store.set(data.key, data.value);
      }
    );

    ipcMain.on(Channel.DeleteStudy, (event: any, data: { name: string }) => {
      console.log('DELETE', data);
      const studies = this.store.get(StoreKey.Studies);
      const annotations = this.store.get(StoreKey.StudyAnnotations);
      removeElement(studies, 'name', data.name);
      removeElement(annotations, 'name', data.name);
      this.store.set(StoreKey.Studies, studies);
      this.store.set(StoreKey.StudyAnnotations, annotations);
    });

    ipcMain.on(
      Channel.Request,
      async (
        event: Electron.IpcMainEvent,
        data: { responseChannel: Channel; form: any }
      ) => {
        console.log('DATA', data);
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
              const study = studies.find((s: any) => s.name === form.study);
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
              for (let i = 0; i < files.length; i += 1) {
                console.log(files[i].name);
                console.log(files[i].path);
                const res = await processPupilSamples(
                  files[i].path,
                  DEFAULT_CONFIG
                );
                respondents.push(res);
                message.progress = (i + 1) / files.length;
                event.sender.send(responseChannel, message);
              }
              const group = {
                name: form.name,
                isDependant: form.isDependant,
                respondents,
              };
              study.groups.push(group);
              // studies.push(data);
              this.store.set(StoreKey.Studies, studies);
              message.state = State.Done;
              message.progress = 1;
              message.response = group;
            }
            break;
          default:
            throw new Error('Wrong channel has been passed');
        }
        event.sender.send(responseChannel, message);
      }
    );

    // TODO remove in production
    ipcMain.on(Channel.ClearDB, (e, data) => {
      console.log(e, data);
      this.store.clear();
    });
  }
}

export default DB;
