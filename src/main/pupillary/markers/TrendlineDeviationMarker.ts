import _ from 'lodash';
import lowPassFilter from '../lib/lowPassfilter';
import resampling from '../lib/resampling';
import type { IGap } from './DilationSpeedMarker';
import DilationSpeedMarker from './DilationSpeedMarker';

function getSameTimePoint(
  samples: IPupilSample[],
  timestamp: number,
  startIndex: number
): { sample: IPupilSample | null; nextIndex: number } {
  for (let index = startIndex; index < samples.length; index += 1) {
    const value = samples[index];
    if (Math.round(value.timestamp) === Math.round(timestamp)) {
      return { sample: value, nextIndex: index + 1 };
    }
  }
  return { sample: null, nextIndex: samples.length };
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
      let sampleIndex = 0;
      for (let s = 0; s < data.length; s += 1) {
        const orignalSample = data[s];
        const match = getSameTimePoint(
          smoothed,
          orignalSample.timestamp,
          sampleIndex
        );
        sampleIndex = match.nextIndex;
        const { sample } = match;
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
