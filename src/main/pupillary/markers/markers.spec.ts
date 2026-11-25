import Segment from '../Segment';
import EyeTrackerMarker from './EyeTrackerMarker';
import OutOfRangeMarker from './OutOfRangeMarker';

describe('pupil markers', () => {
  test('accepts values exactly on out-of-range limits', () => {
    const samples: IPupilMarked[] = [
      {
        timestamp: 0,
        leftPupil: 2,
        rightPupil: 9,
        segmentActive: '',
      },
    ];

    const marker = new OutOfRangeMarker(2, 9);
    marker.run(samples);

    expect(samples[0].leftMark).toBeUndefined();
    expect(samples[0].rightMark).toBeUndefined();
  });

  test('preserves the first marker assigned when marker order changes', () => {
    const makeSegment = () =>
      new Segment('Test', [
        {
          timestamp: 0,
          leftPupil: NaN,
          rightPupil: 4,
          segmentActive: '',
        },
        {
          timestamp: 10,
          leftPupil: 4,
          rightPupil: 4,
          segmentActive: '',
        },
      ]);
    const outOfRangeFirst = makeSegment();
    const eyeTrackerFirst = makeSegment();

    outOfRangeFirst.markOutliers([
      new OutOfRangeMarker(2, 9),
      new EyeTrackerMarker(),
    ]);
    eyeTrackerFirst.markOutliers([
      new EyeTrackerMarker(),
      new OutOfRangeMarker(2, 9),
    ]);

    expect(outOfRangeFirst.samples[0].leftMark).toEqual({ type: 'invalid' });
    expect(eyeTrackerFirst.samples[0].leftMark).toEqual({ type: 'missing' });
  });
});
