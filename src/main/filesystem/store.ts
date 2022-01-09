import Store from 'electron-store';
import { ipcMain } from 'electron';
import { Channel } from '../../ipc/channels';

Store.initRenderer();

class DB {
  private store: Store<any>;

  constructor() {
    // still same store
    this.store = new Store({
      schema: {
        studies: {
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

    ipcMain.on(Channel.ApplyForStudies, (event: Electron.IpcMainEvent) => {
      event.sender.send(Channel.GetStudies, 'Loading');
      const studies = this.store.get('studies');
      event.sender.send(Channel.GetStudies, studies);
    });

    ipcMain.on(Channel.CreateStudy, (event: any, data: { name: string }) => {
      console.log(event, data);
      const studies = this.store.get('studies');
      console.log(studies);
      studies.push(data);
      console.log(studies);
      return this.store.set('studies', studies);
    });

    // TODO remove in production
    ipcMain.on(Channel.ClearDB, (e, data) => {
      console.log(e, data);
      this.store.clear();
    });
  }
}

export default DB;
