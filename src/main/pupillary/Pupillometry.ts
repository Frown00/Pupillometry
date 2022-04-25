/* eslint-disable no-underscore-dangle */
import parser from './lib/parser';
import Segment from './Segment';
import segmentation from './lib/segmentation';
import EyeTrackerMarker from './markers/EyeTrackerMarker';
import OutOfRangeMarker from './markers/OutOfRangeMarker';
import DilatationSpeedMarker from './markers/DilatationSpeedMarker';

export default class Pupillometry {
  #name: string;

  #config: IConfig;

  #segments: Segment[];

  #samples: IPupilSampleParsed[];

  constructor(name: string, rawSamples: IPupilSampleRaw[], config: IConfig) {
    this.#name = name;
    this.#config = config;
    this.#samples = parser(rawSamples);
    this.#segments = segmentation(this.#samples, this.#config);
  }

  test(): IPupillometryResult {
    const allMarkers: IMarker[] = this.usedMarkers();
    for (let i = 0; i < this.#segments.length; i += 1) {
      const segment = this.#segments[i];

      segment
        .markOutliers(allMarkers)
        .omitMarked(['missing'])
        .calcMeanPupil()
        .calcMedianDifference()
        .smoothing()
        .calcStats(true);
    }
    return {
      name: this.#name,
      segments: this.#segments.map((s) => s.getInfo()),
      config: this.#config.name,
    };
  }

  process(): IPupillometryResult {
    const allMarkers: IMarker[] = this.usedMarkers();
    for (let i = 0; i < this.#segments.length; i += 1) {
      const segment = this.#segments[i];

      segment
        .markOutliers(allMarkers)
        .omitMarked(['missing', 'outlier', 'invalid'])
        .calcMeanPupil()
        .smoothing()
        .calcStats(true)
        .reduce(true, true);
    }
    return {
      name: this.#name,
      segments: this.#segments.map((s) => s.getInfo()),
      config: this.#config.name,
    };
  }

  private usedMarkers() {
    const { markers } = this.#config;
    const { outOfRange, dilatationSpeed } = markers;
    const allMarkers: IMarker[] = [
      new EyeTrackerMarker(),
      new OutOfRangeMarker(outOfRange.min, outOfRange.max),
    ];
    if (dilatationSpeed.on) {
      allMarkers.push(
        new DilatationSpeedMarker(dilatationSpeed.thresholdMultiplier, {
          min: dilatationSpeed.gapMinimumDuration,
          max: dilatationSpeed.gapMaximumDuration,
          padding: {
            backward: dilatationSpeed.backwardGapPadding,
            forward: dilatationSpeed.forwardGapPadding,
          },
        })
      );
    }
    return allMarkers;
  }

  public get name() {
    return this.#name;
  }

  public get segments() {
    return this.#segments;
  }
}
