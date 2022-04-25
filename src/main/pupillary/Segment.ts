/* eslint-disable no-underscore-dangle */

import {
  max,
  mean,
  median,
  min,
  sampleCorrelation,
  standardDeviation,
} from 'simple-statistics';
import lowPassFilter from './lib/lowPassfilter';
import * as util from './lib/util';

export default class Segment {
  #samples: IPupilSample[];

  #smoothedSamples: IPupilSample[];

  #name: string;

  #sampleRate: number;

  #duration: number;

  #stats: IPupillometryStats;

  #classification: SegmentClass;

  constructor(name: string, samples: IPupilSampleParsed[]) {
    this.#name = name;
    this.#samples = samples;
    this.#classification = 'Valid';
    this.#stats = this.getInitialStats();
    this.#duration = this.calcDuration();
    this.#sampleRate = this.calcSampleRate();
    this.#stats.result.difference = this.calcMedianDifference();
    this.#smoothedSamples = [];
  }

  public get samples() {
    return this.#samples;
  }

  public get sampleRate() {
    return this.#sampleRate;
  }

  public get duration() {
    return this.#duration;
  }

  getInfo(): IPupillometry {
    return {
      samples: this.#samples,
      smoothed: this.#smoothedSamples,
      stats: this.#stats,
      name: this.#name,
      classification: this.#classification,
      sampleRate: this.#sampleRate,
      duration: this.#duration,
    };
  }

  private calcMedianDifference() {
    if (this.#classification === 'Wrong') return Infinity;
    const diff = this.#samples
      .filter((s) => {
        if (s.leftPupil > 0 && s.rightPupil > 0) {
          return s;
        }
        return false;
      })
      .map((s) => Math.abs(s.leftPupil - s.rightPupil));
    return diff.length > 0 ? median(diff) : -1;
  }

  markOutliers(markers: IMarker[]) {
    if (this.#classification === 'Wrong') return this;
    for (let i = 0; i < markers.length; i += 1) {
      const marker = markers[i];
      marker.run(this.#samples);
    }
    return this;
  }

  trialValidity() {
    if (this.#classification === 'Wrong') return this;
    return this;
  }

  resampling() {
    if (this.#classification === 'Wrong') return this;

    return this;
  }

  smoothing() {
    if (this.#classification === 'Wrong') return this;
    this.#smoothedSamples = lowPassFilter(this.#samples, 4, this.#sampleRate);
    return this;
  }

  removeMarked(types: PupilMark[]) {
    for (let i = 0; i < this.#samples.length; i += 1) {
      const sample = this.#samples[i];
      if (sample.rightMark && types.includes(sample.rightMark.type)) {
        sample.rightPupil = NaN;
      }
      if (sample.leftMark && types.includes(sample.leftMark.type)) {
        sample.leftPupil = NaN;
      }
      if (Number.isNaN(sample.rightPupil) && Number.isNaN(sample.leftPupil)) {
        this.#samples.splice(i, 1);
        i -= 1;
      }
    }
    return this;
  }

  calcMeanPupil() {
    if (this.#classification === 'Wrong') return this;
    let dynamicDiffLP = 0;
    for (let i = 0; i < this.#samples.length; i += 1) {
      const sample = this.#samples[i];
      const nextDiff = sample.leftPupil - sample.rightPupil;
      if (nextDiff && !sample.leftMark && !sample.rightMark) {
        dynamicDiffLP = nextDiff;
      }
      const sMean = util.calcMean(
        sample.leftPupil,
        sample.rightPupil,
        dynamicDiffLP
      );
      sample.mean = sMean;
    }
    return this;
  }

  calcStats() {
    if (this.#classification === 'Wrong') return this;
    const dynamicDiffLP = 0;
    const means: number[] = [];
    const lefts: number[] = [];
    const rights: number[] = [];
    // for (let i = 0; i < this.#samples.length; i += 1) {
    //   const sample = this.#samples[i];
    //   const nextDiff = sample.leftPupil - sample.rightPupil;
    //   if (nextDiff) {
    //     dynamicDiffLP = nextDiff;
    //   }
    //   const sMean = util.calcMean(
    //     sample.leftPupil,
    //     sample.rightPupil,
    //     dynamicDiffLP
    //   );
    //   sample.mean = sMean;

    //   if (sMean > 0) {
    //     means.push(sMean);
    //   }
    //   if (sample.leftMark && sample.rightMark) this.#stats.result.missing += 1;

    //   if (sample.leftMark) this.#stats.left.missing += 1;
    //   else lefts.push(sample.leftPupil);

    //   if (sample.rightMark) this.#stats.right.missing += 1;
    //   else rights.push(sample.rightPupil);
    // }

    // if (lefts.length > 1 && rights.length > 1) {
    //   if (lefts.length > rights.length)
    //     this.#stats.result.correlation = sampleCorrelation(lefts, rights);
    //   else this.#stats.result.correlation = sampleCorrelation(rights, lefts);
    // } else this.#stats.result.correlation = 1;

    // this.#stats.result = {
    //   ...this.#stats.result,
    //   min: means.length ? min(means) : -1,
    //   max: means.length ? max(means) : -1,
    //   mean: means.length ? mean(means) : -1,
    //   std: means.length ? standardDeviation(means) : -1,
    // };
    // this.#stats.left = {
    //   ...this.#stats.left,
    //   min: lefts.length ? min(lefts) : -1,
    //   max: lefts.length ? max(lefts) : -1,
    //   mean: lefts.length ? mean(lefts) : -1,
    //   std: lefts.length ? standardDeviation(lefts) : -1,
    // };
    // this.#stats.right = {
    //   ...this.#stats.right,
    //   min: rights.length ? min(rights) : -1,
    //   max: rights.length ? max(rights) : -1,
    //   mean: rights.length ? mean(rights) : -1,
    //   std: rights.length ? standardDeviation(rights) : -1,
    // };
    return this;
  }

  private getInitialStats() {
    return {
      sample: {
        raw: this.#samples.length,
        valid: 0,
        outlier: [],
      },
      result: {
        mean: 0,
        min: Infinity,
        max: -Infinity,
        std: 0,
        difference: 0,
        correlation: 0,
        missing: 0,
      },
      left: {
        min: Infinity,
        max: -Infinity,
        mean: 0,
        std: 0,
        missing: 0,
      },
      right: {
        min: Infinity,
        max: -Infinity,
        mean: 0,
        std: 0,
        missing: 0,
      },
    };
  }

  private calcDuration() {
    if (this.#samples.length < 2) {
      this.#classification = 'Wrong';
      return 0;
    }
    const first = this.#samples[0];
    const last = this.#samples[this.#samples.length - 1];
    const timeDiff = last.timestamp - first.timestamp;
    return Math.round(timeDiff);
  }

  private calcSampleRate() {
    if (this.#classification === 'Wrong') return 0;
    return this.#samples.length / (this.#duration / 1000);
  }
}
