const { contextBridge, ipcRenderer } = require('electron');
const validChannels = require('../ipc/validChannels');

const objValidChannels = Object.values(validChannels);

contextBridge.exposeInMainWorld('api', {
  ipcRenderer: {
    send(channel, value) {
      if (objValidChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.send(channel, value);
      } else {
        throw new Error('Trying to use invalid channel');
      }
    },

    on(channel, func) {
      ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
    },
    once(channel, func) {
      ipcRenderer.once(channel, (event, ...args) => func(event, ...args));
    },
    removeAllListeners(channel) {
      ipcRenderer.removeAllListeners(channel);
    },
    removeEventListener(channel, listener) {
      ipcRenderer.removeListener(channel, listener);
    },
  },
});
