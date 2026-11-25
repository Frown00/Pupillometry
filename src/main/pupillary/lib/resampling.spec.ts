import resampling from './resampling';

function sample(timestamp: number, mean: number): IPupilSample {
  return {
    timestamp,
    mean,
    leftPupil: mean,
    rightPupil: mean,
    segmentActive: '',
  };
}

describe('resampling', () => {
  test('interpolates at the requested rate when the gap equals the limit', () => {
    const samples = [sample(0, 2), sample(1000, 4)];

    const result = resampling(samples, {
      currentRate: 1,
      wantedRate: 2,
      interpolationGap: 1000,
    });

    expect(result.map((entry) => entry.timestamp)).toEqual([0, 500, 1000]);
    expect(result.map((entry) => entry.mean)).toEqual([2, 3, 4]);
    expect(result[1].meanMark).toBe('upsampled');
    expect(Number.isNaN(result[1].leftPupil)).toBe(true);
  });

  test('preserves a missing interval when the gap exceeds the limit', () => {
    const samples = [sample(0, 2), sample(1000, 4)];

    const result = resampling(samples, {
      currentRate: 1,
      wantedRate: 2,
      interpolationGap: 999,
    });

    expect(result.map((entry) => entry.timestamp)).toEqual([0, 500, 1000]);
    expect(result[0].mean).toBe(2);
    expect(Number.isNaN(result[1].mean)).toBe(true);
    expect(Number.isNaN(result[2].mean)).toBe(true);
  });

  test('places samples on the bin edge in the preceding bin and excludes missing values', () => {
    const samples = [
      sample(0, 2),
      sample(1000, 4),
      sample(1001, 0),
      sample(1500, NaN),
    ];

    const result = resampling(samples, {
      currentRate: 2,
      wantedRate: 1,
      interpolationGap: 0,
    });

    expect(result[0]).toMatchObject({
      timestamp: 0,
      mean: 3,
      meanMark: 'downsampled',
    });
    expect(result[2]).toMatchObject({
      timestamp: 1000,
      mean: 3,
      meanMark: 'binned',
    });
    expect(result[3]).toMatchObject({
      timestamp: 1000,
      mean: Number.NaN,
      meanMark: 'downsampled',
    });
    expect(Number.isNaN(result[3].mean)).toBe(true);
    expect(result[4].timestamp).toBe(1001);
    expect(result[5].timestamp).toBe(1500);
  });
});
