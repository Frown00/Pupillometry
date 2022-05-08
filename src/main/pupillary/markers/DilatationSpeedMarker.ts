import { median } from 'simple-statistics';
import * as util from '../lib/util';

export interface IPupilMarkedWithSpeed extends IPupilMarked {
  speed?: { left?: number; right?: number };
}

export interface IGap {
  min: number;
  max: number;
  padding: { backward: number; forward: number };
}

export default class DilatationSpeedMarker implements IMarker {
  private thresholdMultiplier: number;

  private gap: IGap | undefined;

  private data: IPupilMarkedWithSpeed[] = [];

  constructor(thresholdMultiplier: number, gap?: IGap) {
    this.thresholdMultiplier = thresholdMultiplier;
    this.gap = gap;
  }

  run(data: IPupilMarked[]): void {
    const multipler = this.thresholdMultiplier;
    // side effects
    this.data = data;
    const dilatations = this.setDilatationSpeed();
    const threshold = {
      left: this.calcThreshold(multipler, dilatations.left),
      right: this.calcThreshold(multipler, dilatations.right),
    };
    for (let i = 0; i < this.data.length; i += 1) {
      const sample = this.data[i];
      if (!sample.leftMark) this.tryMarkLeft(sample, threshold.left);
      if (!sample.rightMark) this.tryMarkRight(sample, threshold.right);
      delete this.data[i].speed;
    }

    // indentify gap
    if (!this.gap) return;
    const leftGapMarker = this.markBasedOnGap('left');
    const rightGapMarker = this.markBasedOnGap('right');
    for (let i = 0; i < this.data.length; i += 1) {
      const sample = this.data[i];
      leftGapMarker(sample, Boolean(sample.leftMark));
      rightGapMarker(sample, Boolean(sample.rightMark));
    }
  }

  private markBasedOnGap(eye: 'left' | 'right') {
    let potentialGap: IPupilMarked[] = [];
    const { min, max, padding } = this.gap!;
    const { data } = this;
    const markProperty = eye === 'left' ? 'leftMark' : 'rightMark';
    return function mark(sample: IPupilMarked, isMissing: boolean) {
      if (isMissing) {
        const pupil = eye === 'left' ? sample.leftPupil : sample.rightPupil;
        if (pupil > 0) {
          potentialGap.push(sample);
        }
        return;
      }
      if (potentialGap.length < 2) {
        potentialGap = [];
        return;
      }
      const first = potentialGap[0];
      const last = potentialGap[potentialGap.length - 1];
      const duration = last.timestamp - first.timestamp;
      potentialGap = [];
      if (duration >= min && duration <= max) {
        // mark leading and trailing edges
        const startRange = [
          Math.max(0, first.timestamp - padding.backward),
          first.timestamp,
        ];
        const endRange = [last.timestamp, last.timestamp + padding.forward];
        for (let i = 0; i < data.length; i += 1) {
          const s = data[i];
          // backward
          if (s.timestamp >= startRange[0] && s.timestamp < startRange[1]) {
            if (!s[markProperty]) {
              s[markProperty] = {
                type: 'outliers',
                algorithm: 'Dilatation Speed - Gap',
              };
            }
          }
          // forward
          if (s.timestamp <= endRange[1] && s.timestamp > endRange[0]) {
            if (!s[markProperty]) {
              s[markProperty] = {
                type: 'outliers',
                algorithm: 'Dilatation Speed - Gap',
              };
            }
          }
          if (s.timestamp >= endRange[1]) break;
        }
      }
    };
  }

  private tryMarkLeft(sample: IPupilMarkedWithSpeed, threshold: number) {
    if (!this.isDilatationSpeedInThreshold(sample.speed?.left, threshold)) {
      if (!sample.leftMark) {
        sample.leftMark = {
          type: 'outliers',
          algorithm: 'Dilatation Speed',
        };
      }
    }
  }

  private tryMarkRight(sample: IPupilMarkedWithSpeed, threshold: number) {
    if (!this.isDilatationSpeedInThreshold(sample.speed?.right, threshold)) {
      if (!sample.rightMark) {
        sample.rightMark = {
          type: 'outliers',
          algorithm: 'Dilatation Speed',
        };
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private isDilatationSpeedInThreshold(
    sampleSpeed: number | undefined,
    threshold: number
  ) {
    if (sampleSpeed === undefined) return false;
    if (Number.isNaN(sampleSpeed)) return false;
    if (sampleSpeed > threshold) return false;
    return true;
  }

  private setDilatationSpeed() {
    const dilatationSpeed: { left: number[]; right: number[] } = {
      left: [],
      right: [],
    };
    for (let i = 1; i < this.data.length - 1; i += 1) {
      const row = this.data[i];
      const dLeft = this.calcSampleSpeed(i, 'left');
      const dRight = this.calcSampleSpeed(i, 'right');
      row.speed = {};
      if (!Number.isNaN(dLeft)) {
        row.speed.left = dLeft;
        dilatationSpeed.left.push(dLeft);
      }
      if (!Number.isNaN(dRight)) {
        row.speed.right = dRight;
        dilatationSpeed.right.push(dRight);
      }
    }
    return dilatationSpeed;
  }

  private calcSampleSpeed(index: number, eye: 'left' | 'right') {
    const n = 1;
    const preRow = util.findPreviousSamples(this.data, index, n, eye);
    const row = this.data[index];
    const sucRow = util.findNextSamples(this.data, index, n, eye);
    const preSamples = preRow.map((s) => ({
      timestamp: s?.timestamp,
      value: eye === 'left' ? s?.leftPupil : s?.rightPupil,
    }));
    const sucSamples = sucRow.map((s) => ({
      timestamp: s?.timestamp,
      value: eye === 'left' ? s?.leftPupil : s?.rightPupil,
    }));
    const sample = {
      timestamp: row.timestamp,
      value: eye === 'left' ? row.leftPupil : row.rightPupil,
    };
    if (Number.isNaN(sample.value)) return NaN;
    return this.calcDilatationSpeed(sample, preSamples, sucSamples);
  }

  // eslint-disable-next-line class-methods-use-this
  private calcDilatationSpeed(
    sample: { timestamp: number; value: number },
    precedingSample: { timestamp: number; value: number }[],
    succeedingSample: { timestamp: number; value: number }[]
  ) {
    const values = [];
    for (let i = 0; i < precedingSample.length; i += 1) {
      const previous = Math.abs(
        (sample.value - precedingSample[i].value) /
          (sample.timestamp - precedingSample[i].timestamp)
      );
      values.push(previous);
    }

    for (let i = 0; i < succeedingSample.length; i += 1) {
      const next = Math.abs(
        (sample.value - succeedingSample[i].value) /
          (sample.timestamp - succeedingSample[i].timestamp)
      );
      values.push(next);
    }
    const validValues = values.filter((v) => !Number.isNaN(v));
    if (validValues.length === 0) return sample.value;
    return Math.max(...validValues);
  }

  // eslint-disable-next-line class-methods-use-this
  private calcThreshold(n: number, dilatationSpeeds: number[]) {
    const medianSeriesSpeed =
      dilatationSpeeds.length > 0 ? median(dilatationSpeeds) : 0;
    const MAD = this.calcMAD(dilatationSpeeds, medianSeriesSpeed);
    return medianSeriesSpeed + n * MAD;
  }

  // eslint-disable-next-line class-methods-use-this
  private calcMAD(dilatationSpeeds: number[], medianSeriesSpeed: number) {
    const series = [];
    for (let i = 0; i < dilatationSpeeds.length; i += 1) {
      const speed = dilatationSpeeds[i];
      series.push(Math.abs(speed - medianSeriesSpeed));
    }
    return series.length > 0 ? median(series) : medianSeriesSpeed;
  }
}
