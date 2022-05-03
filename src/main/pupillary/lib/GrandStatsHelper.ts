import { mean } from 'simple-statistics';

export default class GrandStatsHelper {
  #property: 'mean' | 'std';

  #grand: IGrandValue = {
    normal: 0,
    smoothed: 0,
    corrected: {
      minus: {
        normal: 0,
        smoothed: 0,
      },
      divide: {
        normal: 0,
        smoothed: 0,
      },
    },
  };

  #means: {
    normal: number[];
    smoothed: number[];
    baselineMinus: {
      normal: number[];
      smoothed: number[];
    };
    baselineDivide: {
      normal: number[];
      smoothed: number[];
    };
  } = {
    normal: [],
    smoothed: [],
    baselineMinus: {
      normal: [],
      smoothed: [],
    },
    baselineDivide: {
      normal: [],
      smoothed: [],
    },
  };

  constructor(property: 'mean' | 'std') {
    this.#property = property;
  }

  add(stats: IPupillometryStats, baseline?: IBaselineInfo) {
    const { result, resultSmoothed } = stats;
    this.#means.normal.push(result[this.#property]);
    this.#means.smoothed.push(resultSmoothed[this.#property]);
    if (baseline) {
      this.#means.baselineMinus.normal.push(
        baseline.minusStats.result[this.#property]
      );
      this.#means.baselineMinus.smoothed.push(
        baseline.minusStats.resultSmoothed[this.#property]
      );
      this.#means.baselineDivide.normal.push(
        baseline.divideStats.result[this.#property]
      );
      this.#means.baselineDivide.smoothed.push(
        baseline.divideStats.resultSmoothed[this.#property]
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getCalc(arr: number[]) {
    return arr.length ? mean(arr) : NaN;
  }

  calc() {
    this.#grand = {
      normal: this.getCalc(this.#means.normal),
      smoothed: this.getCalc(this.#means.smoothed),
      corrected: {
        minus: {
          normal: this.getCalc(this.#means.baselineMinus.normal),
          smoothed: this.getCalc(this.#means.baselineMinus.smoothed),
        },
        divide: {
          normal: this.getCalc(this.#means.baselineDivide.normal),
          smoothed: this.getCalc(this.#means.baselineDivide.smoothed),
        },
      },
    };
    return this.#grand;
  }

  getGrand() {
    return this.#grand;
  }
}
