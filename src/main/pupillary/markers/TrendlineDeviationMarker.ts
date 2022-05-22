import _ from 'lodash';
import lowPassFilter from '../lib/lowPassfilter';
import resampling from '../lib/resampling';
import type { IGap } from './DilationSpeedMarker';
import DilationSpeedMarker from './DilationSpeedMarker';

function getNextValid(samples: IPupilSample[]) {
  return function* generate() {
    for (let i = 0; i < samples.length; i += 1) {
      yield samples[i];
    }
  };
}

function getSameTimePoint(
  sampleGenerator: Generator<IPupilSample, void, unknown>,
  timestamp: number
) {
  let value = null;
  while (true) {
    value = <IPupilSample>sampleGenerator.next().value;
    if (!value) break;
    const sample =
      Math.round(value.timestamp) === Math.round(timestamp) ? value : null;
    if (sample !== null) return sample;
  }
  return value;
}

export default class TrendlineDeviationMarker implements IMarker {
  private passes: number;

  private cutoff: number;

  private dilatationMarker: DilationSpeedMarker;

  constructor(
    passes: number,
    thresholdMultiplier: number,
    gap: IGap,
    cutoff: number
  ) {
    this.passes = passes;
    this.cutoff = cutoff;
    this.dilatationMarker = new DilationSpeedMarker(thresholdMultiplier, gap);
  }

  name = 'Trendline Deviation';

  run(data: IPupilMarked[]): void {
    for (let i = 0; i < this.passes; i += 1) {
      const dataCopy = _.cloneDeep(data);
      const interpolated = resampling(dataCopy, {
        currentRate: 100,
        wantedRate: 1000,
        interpolationGap: -1,
      });
      const smoothed = lowPassFilter(interpolated, this.cutoff, 1000);
      this.dilatationMarker.run(smoothed);
      const valid = getNextValid(smoothed)();
      for (let s = 0; s < data.length; s += 1) {
        const orignalSample = data[s];
        const sample = getSameTimePoint(valid, orignalSample.timestamp);
        this.tryMarkLeft(orignalSample, sample);
        this.tryMarkRight(orignalSample, sample);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private tryMarkLeft(
    orginalSample: IPupilMarked,
    sample?: IPupilSample | null
  ) {
    if (!sample) return;
    if (orginalSample.leftMark) return;
    if (sample.leftMark?.type === 'outliers') {
      orginalSample.leftMark = {
        type: 'outliers',
        algorithm: 'Trendline Deviation',
      };
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private tryMarkRight(
    orginalSample: IPupilMarked,
    sample?: IPupilSample | null
  ) {
    if (!sample) return;
    if (orginalSample.rightMark) return;
    if (sample.rightMark?.type === 'outliers') {
      orginalSample.rightMark = {
        type: 'outliers',
        algorithm: 'Trendline Deviation',
      };
    }
  }
}
