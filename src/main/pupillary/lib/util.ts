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

export function findNextSamples(
  samples: IPupilSampleParsed[],
  index: number,
  n: number,
  eye: 'left' | 'right'
) {
  const next = [];
  for (let i = index + 1; i < samples.length; i += 1) {
    const val = eye === 'left' ? samples[i].leftPupil : samples[i].rightPupil;
    if (!Number.isNaN(val) && val > 0) {
      next.push(samples[i]);
    }
    if (next.length === n) break;
  }
  return next;
}

export function findPreviousSamples(
  samples: IPupilSampleParsed[],
  index: number,
  n: number,
  eye: 'left' | 'right'
) {
  const previous = [];
  for (let i = index - 1; i >= 0; i -= 1) {
    const val = eye === 'left' ? samples[i].leftPupil : samples[i].rightPupil;
    if (!Number.isNaN(val) && val > 0) {
      previous.push(samples[i]);
    }
    if (previous.length === n) break;
  }
  return previous;
}
