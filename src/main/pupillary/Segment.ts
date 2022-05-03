/* eslint-disable no-underscore-dangle */
import {
  max,
  mean,
  median,
  min,
  sampleCorrelation,
  standardDeviation,
} from 'simple-statistics';
import lib from './lib';
import * as util from './lib/util';

export default class Segment {
  #samples: IPupilSample[];

  #smoothedSamples: IPupilSample[];

  #name: string;

  #sampleRate: number;

  #duration: number;

  #stats: IPupillometryStats;

  #classification: SegmentClass;

  #baseline: IBaselineInfo;

  constructor(name: string, samples: IPupilSampleParsed[]) {
    this.#name = name;
    this.#samples = samples;
    this.#classification = 'Valid';
    this.#stats = this.getInitialStats();
    this.#duration = this.calcDuration();
    this.#sampleRate = this.calcSampleRate();
    // this.calcMedianDifference();
    this.#smoothedSamples = [];
    this.#baseline = {
      value: 0,
      divideStats: this.getInitialStats(),
      substractStats: this.getInitialStats(),
    };
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

  public get name() {
    return this.#name;
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
      baseline: this.#baseline,
    };
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

  resampling(on: boolean, rate: number, gap: number) {
    if (!on) return this;
    if (this.#classification === 'Wrong') return this;
    this.#samples = lib.resampling(this.#samples, {
      currentRate: this.sampleRate,
      wantedRate: rate,
      interpolationGap: gap,
    });
    this.#duration = this.calcDuration();
    this.#sampleRate = this.calcSampleRate();
    return this;
  }

  smoothing(on: boolean, cutoff: number) {
    if (!on) return this;
    if (this.#classification === 'Wrong') return this;
    this.#smoothedSamples = lib.lowPassFilter(
      this.#samples,
      cutoff,
      this.#sampleRate
    );
    return this;
  }

  reduce(replaceBySmoothed = true, removeEyePupil = true) {
    if (this.#classification === 'Wrong') return this;
    if (!replaceBySmoothed) return this;
    for (let i = 0; i < this.#samples.length; i += 1) {
      this.#samples[i].mean = this.#smoothedSamples[i].mean;
      if (removeEyePupil) {
        delete this.#samples[i].leftMark;
        delete this.#samples[i].rightMark;
        delete (<any>this.#samples[i]).rightPupil;
        delete (<any>this.#samples[i]).leftPupil;
      }
    }
    this.#smoothedSamples = [];
    return this;
  }

  omitMarked(types: PupilMark[]) {
    for (let i = 0; i < this.#samples.length; i += 1) {
      const sample = this.#samples[i];
      if (sample.rightMark && types.includes(sample.rightMark.type)) {
        sample.rightPupil = NaN;
      }
      if (sample.leftMark && types.includes(sample.leftMark.type)) {
        sample.leftPupil = NaN;
      }
      if (Number.isNaN(sample.rightPupil) && Number.isNaN(sample.leftPupil)) {
        sample.mean = NaN;
      }
    }
    return this;
  }

  setBaseline(params: {
    evaluatedBaseline?: number | undefined;
    baselineWindowSize?: number | undefined;
  }) {
    const { baselineWindowSize, evaluatedBaseline } = params;
    if (evaluatedBaseline !== undefined) {
      this.#baseline.value = evaluatedBaseline;
      return this;
    }
    const baselineWindow = [];
    const windowSize = Math.max(0, baselineWindowSize || 1000);
    for (let i = 0; i < this.#samples.length; i += 1) {
      if (this.#samples[i].timestamp > windowSize) break;
      baselineWindow.push(this.#samples[i].mean ?? NaN);
    }
    const correctValues = baselineWindow.filter(
      (b) => !Number.isNaN(b) && b > 0
    );
    const baseline = correctValues.length > 0 ? median(correctValues) : 3;
    this.#baseline.value = baseline;
    return this;
  }

  calcBeforeReshape(isChartContinous: boolean) {
    const lefts: number[] = [];
    const rights: number[] = [];
    const leftsCorrelation: number[] = [];
    const rightCorrelation: number[] = [];
    const diff: number[] = [];
    let dynamicDiffLP = 0;
    let lastCorrectMean = 0;

    for (let i = 0; i < this.#samples.length; i += 1) {
      const sample = this.#samples[i];

      // #region MEAN
      const nextDiff = sample.leftPupil - sample.rightPupil;
      if (nextDiff && !sample.leftMark && !sample.rightMark) {
        dynamicDiffLP = nextDiff;
      }
      const sMean = util.calcMean(
        sample.leftMark ? NaN : sample.leftPupil,
        sample.rightMark ? NaN : sample.rightPupil,
        dynamicDiffLP
      );
      if (!Number.isNaN(sMean) && sMean > 0) {
        lastCorrectMean = sMean;
      }
      const value = isChartContinous ? lastCorrectMean : sMean;
      sample.mean = value;
      // #endregion
      // #region Calc Missing
      if (sample.leftMark && sample.rightMark) this.#stats.sample.missing += 1;

      if (sample.leftMark) this.#stats.left.missing += 1;
      else lefts.push(sample.leftPupil);

      if (sample.rightMark) this.#stats.right.missing += 1;
      else rights.push(sample.rightPupil);

      if (!(sample.leftMark || sample.rightMark)) {
        leftsCorrelation.push(sample.leftPupil);
        rightCorrelation.push(sample.rightPupil);
        diff.push(Math.abs(sample.leftPupil - sample.rightPupil));
      }
      // #endregion Calc Missing
    }

    if (leftsCorrelation.length > 1 && rightCorrelation.length > 1) {
      this.#stats.sample.correlation = sampleCorrelation(
        leftsCorrelation,
        rightCorrelation
      );
    } else this.#stats.sample.correlation = 1;

    this.#stats.sample.difference = diff.length > 0 ? median(diff) : -1;

    this.#stats.left = {
      ...this.#stats.left,
      min: lefts.length ? min(lefts) : -1,
      max: lefts.length ? max(lefts) : -1,
      mean: lefts.length ? mean(lefts) : -1,
      std: lefts.length ? standardDeviation(lefts) : -1,
    };
    this.#stats.right = {
      ...this.#stats.right,
      min: rights.length ? min(rights) : -1,
      max: rights.length ? max(rights) : -1,
      mean: rights.length ? mean(rights) : -1,
      std: rights.length ? standardDeviation(rights) : -1,
    };
    this.#stats.sample.valid = this.#samples.reduce(
      (acc, sample) => (!sample.leftMark || !sample.rightMark ? acc + 1 : acc),
      0
    );
    return this;
  }

  calcResultStats(smoothing = false) {
    if (this.#classification === 'Wrong') return this;
    const means: number[] = [];
    const meansSmoothed: number[] = [];
    const substractBaseline: number[] = [];
    const substractBaselineSmoothed: number[] = [];

    const divideBaseline: number[] = [];
    const divideBaselineSmoothed: number[] = [];

    // const samples = baseOnSmoothed ? this.#smoothedSamples : this.#samples;
    for (let i = 0; i < this.#samples.length; i += 1) {
      const sample = this.#samples[i];
      const smoothedSample = this.#smoothedSamples[i];
      sample.baselineSubstract =
        <number>sample.mean - this.#baseline.value || NaN;
      sample.baselineDivide = <number>sample.mean / this.#baseline.value || NaN;
      if (smoothing) {
        smoothedSample.baselineSubstract =
          <number>smoothedSample.mean - this.#baseline.value || NaN;
        smoothedSample.baselineDivide =
          <number>smoothedSample.mean / this.#baseline.value || NaN;
      }

      if (sample.mean) {
        means.push(sample.mean);
        if (sample.baselineSubstract)
          substractBaseline.push(sample.baselineSubstract);
        if (sample.baselineDivide) divideBaseline.push(sample.baselineDivide);
      }
      if (smoothing && smoothedSample.mean) {
        meansSmoothed.push(smoothedSample.mean);
        if (smoothedSample.baselineSubstract)
          substractBaselineSmoothed.push(smoothedSample.baselineSubstract);
        if (smoothedSample.baselineDivide)
          divideBaselineSmoothed.push(smoothedSample.baselineDivide);
      }
    }

    this.#stats.result = this.countResult(means);
    this.#stats.resultSmoothed = this.countResult(meansSmoothed);
    this.#baseline.substractStats.sample = this.#stats.sample;
    this.#baseline.substractStats.result = this.countResult(substractBaseline);
    this.#baseline.substractStats.resultSmoothed = this.countResult(
      substractBaselineSmoothed
    );
    this.#baseline.divideStats.sample = this.#stats.sample;
    this.#baseline.divideStats.result = this.countResult(divideBaseline);
    this.#baseline.divideStats.resultSmoothed = this.countResult(
      divideBaselineSmoothed
    );

    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  private countResult(values: number[]) {
    return {
      min: values.length ? min(values) : -1,
      max: values.length ? max(values) : -1,
      mean: values.length ? mean(values) : -1,
      std: values.length ? standardDeviation(values) : -1,
    };
  }

  private getInitialStats() {
    return {
      sample: {
        raw: this.#samples.length,
        valid: 0,
        outlier: [],
        difference: 0,
        correlation: 0,
        missing: 0,
      },
      result: {
        mean: 0,
        min: Infinity,
        max: -Infinity,
        std: 0,
      },
      resultSmoothed: {
        mean: 0,
        min: Infinity,
        max: -Infinity,
        std: 0,
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
    return Math.floor(this.#samples.length / (this.#duration / 1000));
  }
}
