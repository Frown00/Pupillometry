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

  #zscore: IZscore;

  #percent: IPercentInfo;

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
      minusStats: this.getInitialStats(),
    };
    this.#zscore = {
      standard: this.getInitialStats(),
      minusBaseline: this.getInitialStats(),
      divideBaseline: this.getInitialStats(),
    };
    this.#percent = {
      erpd: this.getInitialStats(),
      relative: this.getInitialStats(),
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
      zscore: this.#zscore,
      percent: this.#percent,
    };
  }

  selectData(eye: 'left' | 'right' | 'both') {
    if (eye === 'both') return this;
    for (let i = 0; i < this.#samples.length; i += 1) {
      const sample = this.#samples[i];
      if (eye === 'left') {
        sample.rightPupil = sample.leftPupil;
      } else if (eye === 'right') {
        sample.leftPupil = sample.rightPupil;
      }
    }
    return this;
  }

  markOutliers(markers: IMarker[]) {
    if (this.#classification === 'Wrong') return this;
    for (let i = 0; i < markers.length; i += 1) {
      const marker = markers[i];
      marker.run(this.#samples);
    }
    return this;
  }

  validity(missing?: number, correlation?: number, pupilDiff?: number) {
    if (this.#classification === 'Wrong') return this;
    if (!missing) return this;
    const missingPercent =
      (this.#stats.sample.missing / this.#stats.sample.raw) * 100;
    if (missingPercent > missing) {
      this.#classification = 'Invalid';
      return this;
    }
    if (!correlation) return this;
    if (this.#stats.sample.correlation < correlation) {
      this.#classification = 'Invalid';
      return this;
    }
    if (!pupilDiff) return this;
    if (this.#stats.sample.difference > pupilDiff)
      this.#classification = 'Invalid';
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
    this.#sampleRate = this.calcSampleRate(on);
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
    for (let i = 0; i < this.#samples.length; i += 1) {
      if (replaceBySmoothed) {
        this.#samples[i].mean = this.#smoothedSamples[i].mean;
        this.#samples[i].baselineMinus = this.#smoothedSamples[i].baselineMinus;
        this.#samples[i].baselineDivide =
          this.#smoothedSamples[i].baselineDivide;
        this.#samples[i].zscore = this.#smoothedSamples[i].zscore;
        this.#samples[i].zscoreMinusBaseline =
          this.#smoothedSamples[i].zscoreMinusBaseline;
        this.#samples[i].zscoreDivideBaseline =
          this.#smoothedSamples[i].zscoreDivideBaseline;
        this.#samples[i].relative = this.#smoothedSamples[i].relative;
        this.#samples[i].erpd = this.#smoothedSamples[i].erpd;
      }
      if (removeEyePupil) {
        delete this.#samples[i].leftMark;
        delete this.#samples[i].rightMark;
        delete (<any>this.#samples[i]).rightPupil;
        delete (<any>this.#samples[i]).leftPupil;
        delete (<any>this.#samples[i]).meanMark;

        if (!replaceBySmoothed) {
          delete this.#smoothedSamples[i].leftMark;
          delete this.#smoothedSamples[i].rightMark;
          delete (<any>this.#smoothedSamples[i]).rightPupil;
          delete (<any>this.#smoothedSamples[i]).leftPupil;
          delete (<any>this.#samples[i]).meanMark;
        }
      }
    }
    if (replaceBySmoothed) {
      this.#smoothedSamples = [];
    }
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
    const startTimestamp = this.#samples[0]?.timestamp ?? 0;
    const windowSize = startTimestamp + Math.max(0, baselineWindowSize || 1000);
    for (let i = 0; i < this.#samples.length; i += 1) {
      if (this.#samples[i].timestamp > windowSize) break;
      const sample = this.#samples[i];
      if (sample.mean) {
        const bmean = sample.mean > 0 ? sample.mean : NaN;
        baselineWindow.push(bmean);
      }
    }
    const correctValues = baselineWindow.filter(
      (b) => !Number.isNaN(b) && b > 0
    );
    const baseline = correctValues.length > 0 ? median(correctValues) : NaN;
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
      const nextDiff =
        (sample.leftPupil || lefts[lefts.length - 1]) -
        (sample.rightPupil || rights[rights.length - 1]);
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
    const minusBaseline: number[] = [];
    const minusBaselineSmoothed: number[] = [];

    const divideBaseline: number[] = [];
    const divideBaselineSmoothed: number[] = [];

    // const samples = baseOnSmoothed ? this.#smoothedSamples : this.#samples;
    for (let i = 0; i < this.#samples.length; i += 1) {
      const sample = this.#samples[i];
      const smoothedSample = this.#smoothedSamples[i];
      if (!sample.mean || sample.mean <= 0) sample.mean = NaN;
      if (!smoothedSample.mean || smoothedSample.mean <= 0)
        smoothedSample.mean = NaN;

      sample.baselineMinus = <number>sample.mean - this.#baseline.value || NaN;
      sample.baselineDivide = <number>sample.mean / this.#baseline.value || NaN;
      if (smoothing) {
        smoothedSample.baselineMinus =
          <number>smoothedSample.mean - this.#baseline.value || NaN;
        smoothedSample.baselineDivide =
          <number>smoothedSample.mean / this.#baseline.value || NaN;
      }

      if (sample.mean && sample.meanMark !== 'binned') {
        means.push(sample.mean);
      }
      if (sample.baselineMinus && sample.meanMark !== 'binned')
        minusBaseline.push(sample.baselineMinus);
      if (sample.baselineDivide && sample.meanMark !== 'binned')
        divideBaseline.push(sample.baselineDivide);

      if (smoothedSample?.mean && sample.meanMark !== 'binned') {
        meansSmoothed.push(smoothedSample.mean);
      }
      if (smoothedSample?.baselineMinus && sample.meanMark !== 'binned')
        minusBaselineSmoothed.push(smoothedSample.baselineMinus);
      if (smoothedSample?.baselineDivide && sample.meanMark !== 'binned')
        divideBaselineSmoothed.push(smoothedSample.baselineDivide);
    }

    this.#stats.result = this.countResult(means);
    this.#stats.resultSmoothed = this.countResult(meansSmoothed);
    this.#baseline.minusStats.sample = this.#stats.sample;
    this.#baseline.minusStats.result = this.countResult(minusBaseline);
    this.#baseline.minusStats.resultSmoothed = this.countResult(
      minusBaselineSmoothed
    );
    this.#baseline.divideStats.sample = this.#stats.sample;
    this.#baseline.divideStats.result = this.countResult(divideBaseline);
    this.#baseline.divideStats.resultSmoothed = this.countResult(
      divideBaselineSmoothed
    );
    return this;
  }

  calcAdvancedMeasures(
    smoothing: boolean,
    meanGrand: IGrandValue,
    stdGrand: IGrandValue
  ) {
    // Calc z-score
    const zscore = [];
    const zscoreSmoothed = [];
    const zscoreMinus = [];
    const zscoreMinusSmoothed = [];
    const zscoreDivide = [];
    const zscoreDivideSmoothed = [];
    const relative = [];
    const relativeSmoothed = [];
    const erpd = [];
    const erpdSmoothed = [];
    const zscoreFun = (value: number, meanG: number, stdG: number) =>
      (value - meanG) / stdG || NaN;
    const relativeFun = (value: number, meanG: number) =>
      ((value - meanG) / meanG) * 100 || NaN;
    // event related pupil dilatation (pcpd)
    const erpdFun = (value: number) =>
      ((value - this.#baseline.value) / this.#baseline.value) * 100 || NaN;
    for (let i = 0; i < this.#samples.length; i += 1) {
      const sample = this.#samples[i];
      const smoothedSample = this.#smoothedSamples[i] ?? {};
      // eslint-disable-next-line no-continue
      if (!sample) continue;
      if (!sample.mean || sample.mean <= 0) sample.mean = NaN;
      if (!smoothedSample.mean || smoothedSample.mean <= 0)
        smoothedSample.mean = NaN;

      sample.zscore = zscoreFun(
        <number>sample.mean,
        meanGrand.normal,
        stdGrand.normal
      );
      sample.zscoreMinusBaseline = zscoreFun(
        <number>sample.mean - this.#baseline.value,
        meanGrand.corrected.minus.normal,
        stdGrand.corrected.minus.normal
      );
      sample.zscoreDivideBaseline = zscoreFun(
        <number>sample.mean / this.#baseline.value,
        meanGrand.corrected.divide.normal,
        stdGrand.corrected.divide.normal
      );
      sample.relative = relativeFun(<number>sample.mean, meanGrand.normal);
      sample.erpd = erpdFun(<number>sample?.mean);
      if (smoothing) {
        smoothedSample.zscore = zscoreFun(
          <number>smoothedSample.mean,
          meanGrand.smoothed,
          stdGrand.smoothed
        );
        smoothedSample.zscoreMinusBaseline = zscoreFun(
          <number>smoothedSample.mean - this.#baseline.value,
          meanGrand.corrected.minus.smoothed,
          stdGrand.corrected.minus.smoothed
        );
        smoothedSample.zscoreDivideBaseline = zscoreFun(
          <number>smoothedSample.mean / this.#baseline.value,
          meanGrand.corrected.divide.smoothed,
          stdGrand.corrected.divide.smoothed
        );
        smoothedSample.relative = relativeFun(
          <number>smoothedSample.mean,
          meanGrand.normal
        );
        smoothedSample.erpd = erpdFun(<number>smoothedSample.mean);
      }
      if (sample.zscore && sample.meanMark !== 'binned') {
        zscore.push(sample.zscore);
      }
      if (sample.zscoreMinusBaseline && sample.meanMark !== 'binned') {
        zscoreMinus.push(sample.zscoreMinusBaseline);
      }
      if (sample.zscoreDivideBaseline && sample.meanMark !== 'binned') {
        zscoreDivide.push(sample.zscoreDivideBaseline);
      }
      if (sample.relative && sample.meanMark !== 'binned') {
        relative.push(sample.relative);
      }
      if (sample.erpd && sample.meanMark !== 'binned') {
        erpd.push(sample.erpd);
      }

      if (smoothedSample?.zscore && smoothedSample.meanMark !== 'binned') {
        zscoreSmoothed.push(smoothedSample.zscore);
      }
      if (
        smoothedSample?.zscoreMinusBaseline &&
        smoothedSample.meanMark !== 'binned'
      ) {
        zscoreMinusSmoothed.push(smoothedSample.zscoreMinusBaseline);
      }
      if (
        smoothedSample?.zscoreDivideBaseline &&
        smoothedSample.meanMark !== 'binned'
      ) {
        zscoreDivideSmoothed.push(smoothedSample.zscoreDivideBaseline);
      }
      if (smoothedSample?.relative && smoothedSample.meanMark !== 'binned') {
        relativeSmoothed.push(smoothedSample.relative);
      }
      if (smoothedSample?.erpd && smoothedSample.meanMark !== 'binned') {
        erpdSmoothed.push(smoothedSample.erpd);
      }
    }
    this.#zscore.standard.sample = this.#stats.sample;
    this.#zscore.standard.result = this.countResult(zscore);
    this.#zscore.standard.resultSmoothed = this.countResult(zscoreSmoothed);

    this.#zscore.minusBaseline.sample = this.#stats.sample;
    this.#zscore.minusBaseline.result = this.countResult(zscoreMinus);
    this.#zscore.minusBaseline.resultSmoothed =
      this.countResult(zscoreMinusSmoothed);

    this.#zscore.divideBaseline.sample = this.#stats.sample;
    this.#zscore.divideBaseline.result = this.countResult(zscoreDivide);
    this.#zscore.divideBaseline.resultSmoothed =
      this.countResult(zscoreDivideSmoothed);

    this.#percent.relative.sample = this.#stats.sample;
    this.#percent.relative.result = this.countResult(relative);
    this.#percent.relative.resultSmoothed = this.countResult(relativeSmoothed);

    this.#percent.erpd.sample = this.#stats.sample;
    this.#percent.erpd.result = this.countResult(erpd);
    this.#percent.erpd.resultSmoothed = this.countResult(erpdSmoothed);
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

  private calcSampleRate(isResampled = false) {
    if (this.#classification === 'Wrong') return 0;
    let samples = this.#samples.length;
    if (isResampled) {
      samples = this.#samples.reduce(
        (acc, s) =>
          s.meanMark === 'upsampled' || s.meanMark === 'downsampled'
            ? acc + 1
            : acc,
        0
      );
    }
    return Math.floor(samples / (this.#duration / 1000));
  }
}
