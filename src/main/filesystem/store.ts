/* eslint-disable no-await-in-loop */
import Store from 'electron-store';
import { ipcMain } from 'electron';
import { Channel } from '../../ipc/channels';
import { processPupilSamples } from '../pupillary/process';
import * as configJSON from '../pupillary/config.json';

const DEFAULT_CONFIG = configJSON as IConfig;

Store.initRenderer();

class DB {
  private store: Store<any>;

  constructor() {
    // still same store
    this.store = new Store({
      schema: {
        studiesSimple: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
          default: [],
        },
        studies: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
              groups: {
                type: 'array',
                properties: {
                  name: {
                    type: 'string',
                  },
                  isDependent: {
                    type: 'boolean',
                  },
                  respondents: {
                    type: 'array',
                  },
                },
              },
            },
          },
          default: [],
        },
        recent: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
          },
        },
      },
    });
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

    ipcMain.on(
      Channel.Request,
      async (
        event: Electron.IpcMainEvent,
        data: { responseChannel: Channel; form: any }
      ) => {
        console.log('DATA', data);
        const { responseChannel, form } = data;
        event.sender.send(responseChannel, 'loading');
        let response = null;
        switch (responseChannel) {
          case Channel.GetStudies:
            response = this.store.get('studiesSimple');
            break;
          case Channel.GetStudy:
            {
              const studies = this.store.get('studies');
              const study = studies.find((s: any) => s.name === form.study);
              response = study;
            }
            break;
          case Channel.CreateStudy:
            {
              const studiesSimple = this.store.get('studiesSimple');
              const studies = this.store.get('studies');
              studiesSimple.push({ name: form.name });
              studies.push(form);
              this.store.set('studiesSimple', studiesSimple);
              this.store.set('studies', studies);
              response = 'OK';
            }
            break;
          case Channel.CreateGroup:
            {
              const studies = this.store.get('studies');
              const study = studies.find((s: any) => s.name === form.study);
              // console.log('FORM', form);
              if (!study.groups) study.groups = [];

              const { files } = form;
              const respondents = [];
              for (let i = 0; i < files.length; i += 1) {
                console.log(files[i].name);
                console.log(files[i].path);
                const res = await processPupilSamples(
                  files[i].path,
                  DEFAULT_CONFIG
                );
                respondents.push(res);
                // console.log(res.name, res.segments.length);
              }
              study.groups.push({
                name: form.name,
                isDependent: form.isDependent,
                respondents,
              });
              // studies.push(data);
              this.store.set('studies', studies);
              response = 'OK';
            }
            break;
          default:
            throw new Error('Wrong channel has been passed');
        }
        event.sender.send(responseChannel, response);
      }
    );

    // ipcMain.on(Channel.CreateStudy, (event: any, data: { name: string }) => {
    //   console.log(event, data);
    //   const studies = this.store.get('studies');
    //   console.log(studies);
    //   studies.push(data);
    //   console.log(studies);
    //   return this.store.set('studies', studies);
    // });

    // ipcMain.on(Channel.)

    // TODO remove in production
    ipcMain.on(Channel.ClearDB, (e, data) => {
      console.log(e, data);
      this.store.clear();
    });
  }
}

export default DB;
