interface ElectronApi {
  ipcRenderer: {
    loadData: () => void;
    on: (channel: string, func: any) => void;
    once: (channel: string, func: any) => void;
  };
}

export default class ElectronWindow {
  private static instance: ElectronWindow;

  global: Window;

  api: ElectronApi;

  // static api = {
  //   ...window,
  //   api: {
  //     ipcRenderer: {
  //       loadData: null;
  //       on: (channel: string, func: any) => void;
  //       once: (channel: string, func: any) => void;
  //     };
  //   };
  // };
  private constructor() {
    this.global = window;
    this.api = (<any>window).api;
  }

  public static get(): ElectronWindow {
    if (!ElectronWindow.instance) {
      ElectronWindow.instance = new ElectronWindow();
    }
    return ElectronWindow.instance;
  }
}
