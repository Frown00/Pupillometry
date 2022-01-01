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

  activateIPC(): void {
    ipcMain.handle(Channel.getStoreValue, (event: any, key) => {
      console.log(key);
      return this.store.get(key);
    });

    ipcMain.on(
      Channel.setStoreValue,
      (event: any, data: { key: string; value: any }) => {
        console.log(data);
        return this.store.set(data.key, data.value);
      }
    );

    ipcMain.on(Channel.applyForStudies, (event: Electron.IpcMainEvent) => {
      event.sender.send(Channel.getStudies, 'Loading');
      const studies = this.store.get('studies');
      event.sender.send(Channel.getStudies, studies);
    });

    ipcMain.on(Channel.createStudy, (event: any, data: { name: string }) => {
      console.log(event, data);
      const studies = this.store.get('studies');
      console.log(studies);
      studies.push(data);
      console.log(studies);
      return this.store.set('studies', studies);
    });
  }

  clear() {
    this.store.clear();
  }
}

export default DB;
