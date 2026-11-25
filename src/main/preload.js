const { contextBridge, ipcRenderer } = require('electron');
const validChannels = require('../ipc/validChannels');

const objValidChannels = Object.values(validChannels);

/** @type {{ ipcRenderer: import('../ipc/types').IIpcRendererApi }} */
const api = {
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
      if (objValidChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(event, args[0]));
      } else {
        throw new Error('Trying to use invalid channel');
      }
    },
    once(channel, func) {
      if (objValidChannels.includes(channel)) {
        ipcRenderer.once(channel, (event, ...args) => func(event, args[0]));
      } else {
        throw new Error('Trying to use invalid channel');
      }
    },
    removeAllListeners(channel) {
      if (objValidChannels.includes(channel) || /_response/.test(channel)) {
        ipcRenderer.removeAllListeners(channel);
      } else {
        throw new Error('Trying to use invalid channel');
      }
    },
    removeEventListener(channel, listener) {
      if (objValidChannels.includes(channel) || /_response/.test(channel)) {
        ipcRenderer.removeListener(channel, listener);
      } else {
        throw new Error('Trying to use invalid channel');
      }
    },
  },
};

contextBridge.exposeInMainWorld('api', api);
