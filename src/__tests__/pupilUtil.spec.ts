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
