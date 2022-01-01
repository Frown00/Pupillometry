const { contextBridge, ipcRenderer } = require('electron');
const validChannels = require('../ipc/validChannels');

const objValidChannels = Object.values(validChannels);

contextBridge.exposeInMainWorld('api', {
  ipcRenderer: {
    loadData() {
      ipcRenderer.send('load-pupillary', 'ping');
    },
    send(key, value) {
      ipcRenderer.send(key, value);
    },
    // createProject(props: { name: string }) {
    //   ipcRenderer.send(validChannels.createStudy, props);
    // },
    on(channel, func) {
      if (objValidChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      } else {
        throw new Error('Trying to use invalid channel');
      }
    },
    once(channel, func) {
      if (objValidChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      } else {
        throw new Error('Trying to use invalid channel');
      }
    },
    removeAllListeners(channel) {
      ipcRenderer.removeAllListeners(channel);
    },
    removeEventListener(channel, listener) {
      ipcRenderer.removeListener(channel, listener);
    },
  },
});
