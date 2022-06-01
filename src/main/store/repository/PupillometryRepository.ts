/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { State } from '../../../ipc/interfaces';
import Pupillometry from '../../pupillary/Pupillometry';
import sampleLoader from '../../pupillary/lib/sampleLoader';
import type { IPupillometryResponse } from '../../../ipc/channels/PupillometryChannel';

export interface IPupillometryQuery {
  form?: {
    config: IConfig | null;
    files?: { path: string }[];
  };
  export?: {
    study: IStudy;
    taskGroups: {
      [groupName: string]: ITaskGroup[];
    };
  };
}

export default abstract class PupillometryRepository {
  static async test(
    paths: string[],
    config: IConfig,
    saveCallback: (response: IPupillometryResponse) => void
  ) {
    const runCallback = (
      name: string,
      rawData: IPupilSampleRaw[],
      cfg: IConfig
    ) => {
      const pupillometry = new Pupillometry(name, rawData, cfg);
      return pupillometry.test();
    };
    return PupillometryRepository.wrapper(
      paths,
      config,
      runCallback,
      saveCallback
    );
  }

  static async process(
    paths: string[],
    config: IConfig,
    saveCallback: (response: IPupillometryResponse) => void
  ) {
    const runCallback = (
      name: string,
      rawData: IPupilSampleRaw[],
      cfg: IConfig
    ) => {
      const pupillometry = new Pupillometry(name, rawData, cfg);
      return pupillometry.process();
    };
    return PupillometryRepository.wrapper(
      paths,
      config,
      runCallback,
      saveCallback,
      true
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private static async wrapper(
    paths: string[],
    config: IConfig,
    funName: (
      name: string,
      rawData: IPupilSampleRaw[],
      config: IConfig
    ) => IPupillometryResult,
    saveCallback?: (response: IPupillometryResponse) => void,
    isReduce = false
  ) {
    const results: IPupillometryResult[] = [];
    for (const path of paths) {
      const samples = await sampleLoader(path, config);
      const p = funName(samples.name, samples.rawData, config);
      if (saveCallback) {
        saveCallback({
          result: [p],
          state: State.Loading,
          progress: 0,
        });
      }

      const segments = isReduce
        ? p.segments.map((s) => {
            s.samples = [];
            s.smoothed = [];
            return s;
          })
        : p.segments;
      results.push({
        name: p.name,
        config: p.config,
        dataPath: p.dataPath,
        meanGrand: p.meanGrand,
        stdGrand: p.stdGrand,
        segments,
      });
    }
    return results;
  }
}
