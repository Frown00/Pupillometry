/* eslint-disable import/prefer-default-export */

export function isETMarkedAsCorrect(sample: number) {
  if (Number.isNaN(sample)) return false;
  if (!sample.toString().trim()) return false;
  if (sample <= 0) return false;
  return true;
}
/**
 * Marks as NaN when sample is invalid
 * @param sample
 * @param min
 * @param max
 * @returns
 */
export function inRange(sample: number, min: number, max: number) {
  if (Number.isNaN(sample)) return false;
  if (sample < min) return false;
  if (sample > max) return false;
  return true;
}

export function isAcceptableDifference(
  left: number,
  right: number,
  limit: number
) {
  if (Number.isNaN(left) || Number.isNaN(right)) return true;
  const diff = Math.abs(left - right);
  if (diff > limit) return false;
  return true;
}

export function isDilatationSpeedInThreshold(
  sampleSpeed: number | undefined,
  threshold: number
) {
  if (sampleSpeed === undefined) return false;
  if (Number.isNaN(sampleSpeed)) return false;
  if (sampleSpeed > threshold) return false;
  return true;
}
