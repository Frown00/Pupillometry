import { median } from 'simple-statistics';
import * as util from '../util';

interface ISample {
  timestamp: number;
  value: number;
}

export function calcDilatationSpeed(
  sample: ISample,
  precedingSample: ISample,
  succeedingSample: ISample
) {
  const previous = Math.abs(
    (sample.value - precedingSample.value) /
      (sample.timestamp - precedingSample.timestamp)
  );
  const next = Math.abs(
    (succeedingSample.value - sample.value) /
      (succeedingSample.timestamp - sample.timestamp)
  );
  if (!Number.isNaN(previous) && !Number.isNaN(next))
    return Math.max(previous, next);
  if (!Number.isNaN(previous)) return previous;
  if (!Number.isNaN(next)) return next;
  return sample.value;
}

export function calcSampleSpeed(
  preprocessed: IPupilSamplePreprocessed[],
  index: number,
  eye: 'left' | 'right'
) {
  const n = 1;
  const preRow = util.findPreviousSamples(preprocessed, index, n, eye)[0];
  const row = preprocessed[index];
  const sucRow = util.findNextSamples(preprocessed, index, n, eye)[0];
  const preSample = {
    timestamp: preRow?.timestamp,
    value: eye === 'left' ? preRow?.leftPupil : preRow?.rightPupil,
  };
  const sample = {
    timestamp: row.timestamp,
    value: eye === 'left' ? row.leftPupil : row.rightPupil,
  };
  const sucSample = {
    timestamp: sucRow?.timestamp,
    value: eye === 'left' ? sucRow?.leftPupil : sucRow?.rightPupil,
  };
  if (Number.isNaN(sample.value)) return NaN;
  return calcDilatationSpeed(sample, preSample, sucSample);
}

export function setDilatationSpeed(preprocessed: IPupilSamplePreprocessed[]) {
  const dilatationSpeed: { left: number[]; right: number[] } = {
    left: [],
    right: [],
  };
  for (let i = 1; i < preprocessed.length - 1; i += 1) {
    const row = preprocessed[i];
    const dLeft = calcSampleSpeed(preprocessed, i, 'left');
    const dRight = calcSampleSpeed(preprocessed, i, 'right');
    row.dilatationSpeed = {};
    if (!Number.isNaN(dLeft)) {
      row.dilatationSpeed.left = dLeft;
      dilatationSpeed.left.push(dLeft);
    }
    if (!Number.isNaN(dRight)) {
      row.dilatationSpeed.right = dRight;
      dilatationSpeed.right.push(dRight);
    }
  }
  return dilatationSpeed;
}

function calcMAD(dilatationSpeeds: number[], medianSeriesSpeed: number) {
  const series = [];
  for (let i = 0; i < dilatationSpeeds.length; i += 1) {
    const speed = dilatationSpeeds[i];
    series.push(Math.abs(speed - medianSeriesSpeed));
  }
  return series.length > 0 ? median(series) : medianSeriesSpeed;
}

export function calcThreshold(n: number, dilatationSpeeds: number[]) {
  const medianSeriesSpeed =
    dilatationSpeeds.length > 0 ? median(dilatationSpeeds) : 0;
  const MAD = calcMAD(dilatationSpeeds, medianSeriesSpeed);
  return medianSeriesSpeed + n * MAD;
}
