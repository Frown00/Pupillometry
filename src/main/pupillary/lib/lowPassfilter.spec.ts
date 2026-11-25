import lowPassFilter from './lowPassfilter';

describe('low-pass filter', () => {
  test('leaves missing values untouched and does not advance through binned values', () => {
    const samples: IPupilSample[] = [
      {
        timestamp: 0,
        mean: NaN,
        leftPupil: NaN,
        rightPupil: NaN,
        segmentActive: '',
      },
      {
        timestamp: 1,
        mean: 2,
        leftPupil: 2,
        rightPupil: 2,
        segmentActive: '',
      },
      {
        timestamp: 2,
        mean: 4,
        leftPupil: 4,
        rightPupil: 4,
        segmentActive: '',
      },
      {
        timestamp: 3,
        mean: NaN,
        leftPupil: NaN,
        rightPupil: NaN,
        segmentActive: '',
      },
      {
        timestamp: 4,
        mean: 10,
        leftPupil: 10,
        rightPupil: 10,
        segmentActive: '',
        meanMark: 'binned',
      },
    ];

    const result = lowPassFilter(samples, 1, 1);
    const alpha = 1 / (1 + 1 / (2 * Math.PI));

    expect(Number.isNaN(result[0].mean)).toBe(true);
    expect(result[1].mean).toBe(2);
    expect(result[2].mean).toBeCloseTo(2 + alpha * 2);
    expect(Number.isNaN(result[3].mean)).toBe(true);
    expect(result[4].mean).toBe(result[2].mean);
    expect(samples[4].mean).toBe(10);
  });
});
