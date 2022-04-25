import ElectronStore from 'electron-store';
import configJSON from '../pupillary/config.json';

const DEFAULT_CONFIG = configJSON as IConfig;

type StoreKey = keyof IStore;
type ValueOf<T> = T[keyof T];
export default class Store {
  private static instance: Store;

  private static store = new ElectronStore<IStore>();

  constructor() {
    ElectronStore.initRenderer();
    // still same store
    if (Store.instance) {
      return Store.instance;
    }
    Store.instance = this;
  }

  static get(key: StoreKey) {
    return Store.store.get(key);
  }

  static set(key: StoreKey, value: ValueOf<IStore>) {
    Store.store.set(key, value);
  }

  static clear() {
    Store.store.clear();
  }
}
