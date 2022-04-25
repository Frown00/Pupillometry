import Store from '../Store';
import configJSON from '../../pupillary/config.json';

const DEFAULT_CONFIG = configJSON as IConfig;

export interface IConfigQuery {
  name?: string;
  form?: IConfig;
}

export default abstract class ConfigRepository {
  static create(newConfig?: IConfig) {
    const configs = <IConfigMap>Store.get('configs') ?? {};
    if (!newConfig) return null;
    if (newConfig.name === DEFAULT_CONFIG.name)
      throw new Error(`${DEFAULT_CONFIG.name} is reserved`);
    configs[newConfig.name] = newConfig;
    Store.set('configs', configs);
    return configs[newConfig.name];
  }

  static readOne(name?: string): IConfig {
    const configs = ConfigRepository.readAll();
    if (!name) return DEFAULT_CONFIG;
    return configs[name];
  }

  static readAll(): IConfigMap {
    const configs = <IConfigMap>Store.get('configs') ?? {};
    return {
      ...configs,
      [DEFAULT_CONFIG.name]: DEFAULT_CONFIG,
    };
  }

  static deleteOne(name?: string) {
    if (!name) return null;
    const configs = <IConfigMap>Store.get('configs') ?? {};
    delete configs[name];
    Store.set('configs', configs);
    return name;
  }
}
