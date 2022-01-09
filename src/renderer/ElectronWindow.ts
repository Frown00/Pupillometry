interface ElectronApi {
  ipcRenderer: {
    processPupil: (config: any) => void;
    send: (key: string, value?: any) => void;
    on: (channel: string, func: any) => void;
    once: (channel: string, func: any) => void;
    removeListener: (channel: string, listener: any) => void;
    removeAllListeners: (channel: string) => void;
  };
}

export default class ElectronWindow {
  private static instance: ElectronWindow;

  global: Window;

  api: ElectronApi;

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
