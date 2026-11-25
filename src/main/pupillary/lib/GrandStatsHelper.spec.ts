import GrandStatsHelper from './GrandStatsHelper';

function stats(meanValue: number, smoothedMean: number): IPupillometryStats {
  const result = { mean: meanValue, min: 0, max: meanValue, std: 0 };
  const resultSmoothed = {
    mean: smoothedMean,
    min: 0,
    max: smoothedMean,
    std: 0,
  };
  return {
    sample: {
      raw: 1,
      valid: 1,
      outlier: [],
      difference: 0,
      correlation: 1,
      missing: 0,
    },
    result,
    resultSmoothed,
    left: { ...result, missing: 0 },
    right: { ...result, missing: 0 },
  };
}

function baseline(
  minusMean: number,
  minusSmoothedMean: number,
  divideMean: number,
  divideSmoothedMean: number
): IBaselineInfo {
  return {
    value: 2,
    minusStats: stats(minusMean, minusSmoothedMean),
    divideStats: stats(divideMean, divideSmoothedMean),
  };
}

describe('GrandStatsHelper', () => {
  test('averages valid segment statistics and their baseline corrections', () => {
    const helper = new GrandStatsHelper('mean');

    helper.add(stats(4, 6), baseline(2, 3, 2, 3));
    helper.add(stats(8, 10), baseline(4, 5, 4, 5));
    helper.add(stats(-1, -1));
    helper.add(stats(0, 0));

    expect(helper.calc()).toEqual({
      normal: 6,
      smoothed: 8,
      corrected: {
        minus: { normal: 3, smoothed: 4 },
        divide: { normal: 3, smoothed: 4 },
      },
    });
  });
});
