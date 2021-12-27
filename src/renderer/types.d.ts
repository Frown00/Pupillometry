export interface ElectronWindow extends Window {
  api: {
    ipcRenderer: {
      loadData: () => void;
      on: (channel: string, func: any) => void;
      once: (channel: string, func: any) => void;
    };
  };
}
