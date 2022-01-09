/* eslint-disable import/prefer-default-export */
export function calcMean(left: number, right: number, diff: number) {
  if (left && right) return (left + right) / 2;
  if (left) return (left + (left - diff)) / 2;
  if (right) return (right + (right + diff)) / 2;
  return 0;
}

/**
 * Marks as NaN when sample is invalid
 * @param sample
 * @param min
 * @param max
 * @returns
 */
export function validateSample(sample: number, min: number, max: number) {
  if (!sample.toString().trim()) return NaN;
  if (sample < min) return NaN;
  if (sample > max) return NaN;
  return sample; // valid
}
