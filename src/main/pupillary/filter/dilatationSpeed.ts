import { median } from 'simple-statistics';
import { IPupilSamplePreprocessed } from '../constants';

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
  row: IPupilSamplePreprocessed,
  preRow: IPupilSamplePreprocessed,
  sucRow: IPupilSamplePreprocessed,
  eye: 'left' | 'right'
) {
  const preSample = {
    timestamp: preRow.timestamp,
    value: eye === 'left' ? preRow.leftPupil : preRow.rightPupil,
  };
  const sample = {
    timestamp: row.timestamp,
    value: eye === 'left' ? row.leftPupil : row.rightPupil,
  };
  const sucSample = {
    timestamp: sucRow.timestamp,
    value: eye === 'left' ? sucRow.leftPupil : sucRow.rightPupil,
  };
  if (Number.isNaN(sample.value)) return NaN;

  row.dilatationSpeed = {};
  const dilatation = calcDilatationSpeed(sample, preSample, sucSample);
  if (eye === 'left') row.dilatationSpeed.left = dilatation;
  if (eye === 'right') row.dilatationSpeed.right = dilatation;
  return dilatation;
}

export function setDilatationSpeed(preprocessed: IPupilSamplePreprocessed[]) {
  const dilatationSpeed: { left: number[]; right: number[] } = {
    left: [],
    right: [],
  };
  for (let i = 1; i < preprocessed.length - 1; i += 1) {
    const preRow = preprocessed[i - 1];
    const row = preprocessed[i];
    const sucRow = preprocessed[i + 1];
    const dLeft = calcSampleSpeed(row, preRow, sucRow, 'left');
    const dRight = calcSampleSpeed(row, preRow, sucRow, 'right');
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
  return median(series);
}

export function calcThreshold(n: number, dilatationSpeeds: number[]) {
  const medianSeriesSpeed = median(dilatationSpeeds);
  const MAD = calcMAD(dilatationSpeeds, medianSeriesSpeed);
  return medianSeriesSpeed + n * MAD;
}
