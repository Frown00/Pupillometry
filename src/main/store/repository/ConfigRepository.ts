import Store from '../Store';
import configJSON from '../../pupillary/configs/recommended.json';
import testConfigJSON from '../../pupillary/configs/just-testing.json';

const RECOMMENDED_CONFIG = configJSON as IConfig;
const TESTING_CONFIG = testConfigJSON as IConfig;

export interface IConfigQuery {
  name?: string;
  form?: IConfig;
}

export default abstract class ConfigRepository {
  static create(newConfig?: IConfig) {
    const configs = <IConfigMap>Store.get('configs') ?? {};
    if (!newConfig) return null;
    if (newConfig.name === RECOMMENDED_CONFIG.name)
      throw new Error(`${RECOMMENDED_CONFIG.name} is reserved`);
    if (newConfig.name === TESTING_CONFIG.name)
      throw new Error(`${TESTING_CONFIG.name} is reserved`);
    configs[newConfig.name] = newConfig;
    Store.set('configs', configs);
    return configs[newConfig.name];
  }

  static readOne(name?: string): IConfig {
    const configs = ConfigRepository.readAll();
    if (!name) return RECOMMENDED_CONFIG;
    return configs[name];
  }

  static readAll(): IConfigMap {
    const configs = <IConfigMap>Store.get('configs') ?? {};
    return {
      ...configs,
      [RECOMMENDED_CONFIG.name]: RECOMMENDED_CONFIG,
      [TESTING_CONFIG.name]: TESTING_CONFIG,
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
