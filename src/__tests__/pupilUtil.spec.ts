import * as util from '../main/pupillary/util';

describe('Calc mean', () => {
  describe('Both pupil is valid number', () => {
    test('Positive', () => {
      const leftPupil = 7;
      const rightPupil = 3;
      const diff = Math.abs(leftPupil - rightPupil);
      const mean = util.calcMean(leftPupil, rightPupil, diff);
      expect(mean).toBe(5);
    });
    test('Negative', () => {
      const leftPupil = 3;
      const rightPupil = 7;
      const diff = Math.abs(leftPupil - rightPupil);
      const mean = util.calcMean(leftPupil, rightPupil, diff);
      expect(mean).toBe(5);
    });
  });

  describe('Right pupil is missing', () => {
    test('Positive', () => {
      const leftPupil = 7;
      const rightPupil = NaN;
      const diff = 4;
      const mean = util.calcMean(leftPupil, rightPupil, diff);
      expect(mean).toBe(5);
    });
    test('Negative diff', () => {
      const leftPupil = 3;
      const rightPupil = NaN;
      const diff = -4;
      const mean = util.calcMean(leftPupil, rightPupil, diff);
      expect(mean).toBe(5);
    });
  });

  describe('Left pupil is missing', () => {
    test('Positive', () => {
      const leftPupil = NaN;
      const rightPupil = 3;
      const diff = Math.abs(4);
      const mean = util.calcMean(leftPupil, rightPupil, diff);
      expect(mean).toBe(5);
    });
    test('Negative diff', () => {
      const leftPupil = NaN;
      const rightPupil = 7;
      const diff = -4;
      const mean = util.calcMean(leftPupil, rightPupil, diff);
      expect(mean).toBe(5);
    });
  });
});

describe('Find Samples', () => {
  describe('Previous', () => {
    test('All values are numbers', () => {
      const samples: IPupilSamplePreprocessed[] = [
        {
          timestamp: 1,
          leftPupil: 2.5,
          rightPupil: 3.5,
          meanPupil: 3,
          segmentActive: '',
        },
        {
          timestamp: 2,
          leftPupil: 3,
          rightPupil: 2,
          meanPupil: 3.5,
          segmentActive: '',
        },
        {
          timestamp: 3,
          leftPupil: 4,
          rightPupil: 6,
          meanPupil: 3.5,
          segmentActive: '',
        },
        {
          timestamp: 4,
          leftPupil: 2,
          rightPupil: 3,
          meanPupil: 3.5,
          segmentActive: '',
        },
        {
          timestamp: 5,
          leftPupil: 2.5,
          rightPupil: 4.3,
          meanPupil: 3.5,
          segmentActive: '',
        },
      ];
      const index = 3;
      const n = 2;
      const previous = util.findPreviousSamples(samples, index, n, 'left');
      expect(previous.length).toBe(2);
      expect(previous[0]).toEqual(samples[index - 1]);
      expect(previous[1]).toEqual(samples[index - 2]);
    });

    test('One previous number is NaN', () => {
      const samples: IPupilSamplePreprocessed[] = [
        {
          timestamp: 1,
          leftPupil: 2.5,
          rightPupil: 3.5,
          meanPupil: 3,
          segmentActive: '',
        },
        {
          timestamp: 2,
          leftPupil: 3,
          rightPupil: 2,
          meanPupil: 3.5,
          segmentActive: '',
        },
        {
          timestamp: 3,
          leftPupil: 4,
          rightPupil: NaN,
          meanPupil: NaN,
          segmentActive: '',
        },
        {
          timestamp: 4,
          leftPupil: 2,
          rightPupil: 3,
          meanPupil: 3.5,
          segmentActive: '',
        },
        {
          timestamp: 5,
          leftPupil: 2.5,
          rightPupil: 4.3,
          meanPupil: 3.5,
          segmentActive: '',
        },
      ];
      const index = 3;
      const n = 2;
      const previous = util.findPreviousSamples(samples, index, n, 'right');
      expect(previous.length).toBe(2);
      expect(previous[0]).toEqual(samples[index - 2]);
      expect(previous[1]).toEqual(samples[index - 3]);
    });
  });

  describe('Next', () => {
    test('All values are numbers', () => {
      const samples: IPupilSamplePreprocessed[] = [
        {
          timestamp: 1,
          leftPupil: 2.5,
          rightPupil: 3.5,
          meanPupil: 3,
          segmentActive: '',
        },
        {
          timestamp: 2,
          leftPupil: 3,
          rightPupil: 2,
          meanPupil: 3.5,
          segmentActive: '',
        },
        {
          timestamp: 3,
          leftPupil: 4,
          rightPupil: 6,
          meanPupil: 3.5,
          segmentActive: '',
        },
        {
          timestamp: 4,
          leftPupil: 2,
          rightPupil: 3,
          meanPupil: 3.5,
          segmentActive: '',
        },
        {
          timestamp: 5,
          leftPupil: 2.5,
          rightPupil: 4.3,
          meanPupil: 3.5,
          segmentActive: '',
        },
      ];
      const index = 1;
      const n = 2;
      const previous = util.findNextSamples(samples, index, n, 'left');
      expect(previous.length).toBe(2);
      expect(previous[0]).toEqual(samples[index + 1]);
      expect(previous[1]).toEqual(samples[index + 2]);
    });

    test('One previous number is NaN', () => {
      const samples: IPupilSamplePreprocessed[] = [
        {
          timestamp: 1,
          leftPupil: 2.5,
          rightPupil: 3.5,
          meanPupil: 3,
          segmentActive: '',
        },
        {
          timestamp: 2,
          leftPupil: 3,
          rightPupil: 2,
          meanPupil: 3.5,
          segmentActive: '',
        },
        {
          timestamp: 3,
          leftPupil: 4,
          rightPupil: NaN,
          meanPupil: NaN,
          segmentActive: '',
        },
        {
          timestamp: 4,
          leftPupil: 2,
          rightPupil: 3,
          meanPupil: 3.5,
          segmentActive: '',
        },
        {
          timestamp: 5,
          leftPupil: 2.5,
          rightPupil: 4.3,
          meanPupil: 3.5,
          segmentActive: '',
        },
      ];
      const index = 1;
      const n = 2;
      const previous = util.findNextSamples(samples, index, n, 'right');
      expect(previous.length).toBe(2);
      expect(previous[0]).toEqual(samples[index + 2]);
      expect(previous[1]).toEqual(samples[index + 3]);
    });
  });
});
