import segmentation from './segmentation';

describe('segmentation', () => {
  test('uses inclusive window starts and exclusive ends', () => {
    const samples: IPupilSampleParsed[] = [
      { timestamp: 99, leftPupil: 3, rightPupil: 3, segmentActive: '' },
      { timestamp: 100, leftPupil: 4, rightPupil: 4, segmentActive: '' },
      { timestamp: 199, leftPupil: 5, rightPupil: 5, segmentActive: '' },
      { timestamp: 200, leftPupil: 6, rightPupil: 6, segmentActive: '' },
    ];
    const config = {
      measurement: {
        segmentation: 'time windows',
        windows: ['Task,100,200'],
      },
    } as IConfig;

    const [segment] = segmentation(samples, config);

    expect(segment.name).toBe('Task');
    expect(segment.samples.map((sample) => sample.timestamp)).toEqual([0, 99]);
    expect(samples.map((sample) => sample.timestamp)).toEqual([
      99, 100, 199, 200,
    ]);
  });

  test('starts a new scene after transition rows and resets relative time', () => {
    const samples: IPupilSampleParsed[] = [
      { timestamp: 0, leftPupil: 3, rightPupil: 3, segmentActive: 'Scene A' },
      { timestamp: 10, leftPupil: 4, rightPupil: 4, segmentActive: 'Scene A' },
      {
        timestamp: 20,
        leftPupil: 5,
        rightPupil: 5,
        segmentActive: 'Scene A;Scene B',
      },
      { timestamp: 30, leftPupil: 6, rightPupil: 6, segmentActive: 'Scene B' },
      { timestamp: 40, leftPupil: 7, rightPupil: 7, segmentActive: 'Scene B' },
    ];
    const config = {
      measurement: { segmentation: 'scene' },
    } as IConfig;

    const segments = segmentation(samples, config);

    expect(segments.map((segment) => segment.name)).toEqual([
      'Scene A',
      'Scene B',
    ]);
    expect(
      segments.map((segment) =>
        segment.samples.map((sample) => sample.timestamp)
      )
    ).toEqual([
      [0, 10],
      [0, 10],
    ]);
    expect(samples[2].segmentActive).toBe('Scene A;Scene B');
  });
});
