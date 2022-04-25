/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { State } from '../../../ipc/interfaces';
import Pupillometry from '../../pupillary/Pupillometry';
import sampleLoader from '../../pupillary/lib/sampleLoader';
import type { IPupillometryResponse } from '../../../ipc/channels/PupillometryChannel';

export interface IPupillometryQuery {
  form: {
    config: IConfig;
    files?: { path: string }[];
  };
}

export default abstract class PupillometryRepository {
  static async process(
    paths: string[],
    config: IConfig,
    responseCallback: (response: IPupillometryResponse) => void
  ) {
    const results: IPupillometryResult[] = [];
    for (const path of paths) {
      const samples = await sampleLoader(path, config);
      const pupillometry = new Pupillometry(
        samples.name,
        samples.rawData,
        config
      );
      const p = pupillometry.process();
      results.push(p);
      responseCallback({
        result: [p],
        state: State.Loading,
        progress: 0,
      });
    }
    return results;
  }
}
