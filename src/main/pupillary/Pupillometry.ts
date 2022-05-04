/* eslint-disable no-underscore-dangle */
import parser from './lib/parser';
import Segment from './Segment';
import segmentation from './lib/segmentation';
import EyeTrackerMarker from './markers/EyeTrackerMarker';
import OutOfRangeMarker from './markers/OutOfRangeMarker';
import DilatationSpeedMarker from './markers/DilatationSpeedMarker';
import GrandStatsHelper from './lib/GrandStatsHelper';

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

  private calcBaselineBasedOnSegment(name: string) {
    const { resampling } = this.#config;
    const allMarkers: IMarker[] = this.usedMarkers();
    const toOmit: PupilMark[] = ['missing', 'outlier', 'invalid'];
    const baselineSegmentName = name;
    const isChartContinous = !resampling.acceptableGap;
    const baselineSegment = this.segments.find(
      (s) => s.name.toLowerCase() === baselineSegmentName.toLowerCase()
    );
    return baselineSegment
      ?.markOutliers(allMarkers)
      .omitMarked(toOmit)
      .calcBeforeReshape(isChartContinous)
      .calcResultStats()
      .getInfo().stats.result.mean;
  }

  test(): IPupillometryResult {
    const { resampling, smoothing, measurement } = this.#config;
    const allMarkers: IMarker[] = this.usedMarkers();
    const toOmit: PupilMark[] = ['missing', 'outlier', 'invalid'];
    const isChartContinous = !resampling.acceptableGap;
    const baselineConfig = measurement.baseline;
    let baseline: number | undefined;
    const baseOnSegment = baselineConfig.type === 'selected segment';
    if (baseOnSegment) {
      baseline = this.calcBaselineBasedOnSegment(<string>baselineConfig.param);
    }

    const grandHelperMean = new GrandStatsHelper('mean');
    const grandHelperStd = new GrandStatsHelper('std');

    for (let i = 0; i < this.#segments.length; i += 1) {
      const segment = this.#segments[i];
      // skip baseline segment
      // eslint-disable-next-line no-continue
      if (baseOnSegment && baselineConfig.param === segment.name) continue;

      segment.markOutliers(allMarkers);
      segment.omitMarked(toOmit);
      segment.calcBeforeReshape(isChartContinous);
      segment.resampling(
        resampling.on,
        resampling.rate,
        resampling.acceptableGap
      );
      segment.smoothing(smoothing.on, smoothing.cutoffFrequency);
      segment.setBaseline({
        evaluatedBaseline: baseline,
        baselineWindowSize: <number>baselineConfig.param,
      });
      segment.calcResultStats(smoothing.on);
      const { stats, baseline: corrected } = segment.getInfo();
      grandHelperMean.add(stats, corrected);
      grandHelperStd.add(stats, corrected);
    }

    const meanGrand: IGrandValue = grandHelperMean.calc();
    const stdGrand: IGrandValue = grandHelperStd.calc();

    for (let i = 0; i < this.#segments.length; i += 1) {
      const segment = this.#segments[i];
      // skip baseline segment
      // eslint-disable-next-line no-continue
      if (baseOnSegment && baselineConfig.param === segment.name) continue;
      segment.calcAdvancedMeasures(smoothing.on, meanGrand, stdGrand);
    }

    return {
      name: this.#name,
      segments: this.#segments.map((s) => s.getInfo()),
      config: this.#config.name,
      meanGrand,
      stdGrand,
    };
  }

  process(): IPupillometryResult {
    const { resampling, smoothing, measurement } = this.#config;
    const allMarkers: IMarker[] = this.usedMarkers();
    const toOmit: PupilMark[] = ['missing', 'outlier', 'invalid'];
    const isChartContinous = !resampling?.acceptableGap;
    const baselineConfig = measurement.baseline;
    let baseline: number | undefined;
    const baseOnSegment = baselineConfig.type === 'selected segment';
    if (baseOnSegment) {
      baseline = this.calcBaselineBasedOnSegment(<string>baselineConfig.param);
    }
    const grandHelperMean = new GrandStatsHelper('mean');
    const grandHelperStd = new GrandStatsHelper('std');

    for (let i = 0; i < this.#segments.length; i += 1) {
      const segment = this.#segments[i];

      segment
        .markOutliers(allMarkers)
        .omitMarked(toOmit)
        .calcBeforeReshape(isChartContinous)
        .resampling(resampling.on, resampling.rate, resampling.acceptableGap)
        .smoothing(smoothing.on, smoothing.cutoffFrequency)
        .setBaseline({
          evaluatedBaseline: baseline,
          baselineWindowSize: <number>baselineConfig.param,
        })
        .calcResultStats(smoothing.on);

      const { stats, baseline: corrected } = segment.getInfo();
      grandHelperMean.add(stats, corrected);
      grandHelperStd.add(stats, corrected);
    }

    const meanGrand: IGrandValue = grandHelperMean.calc();
    const stdGrand: IGrandValue = grandHelperStd.calc();

    for (let i = 0; i < this.#segments.length; i += 1) {
      const segment = this.#segments[i];
      // skip baseline segment
      // eslint-disable-next-line no-continue
      if (baseOnSegment && baselineConfig.param === segment.name) continue;
      segment.calcAdvancedMeasures(smoothing.on, meanGrand, stdGrand);
      segment.reduce(smoothing.on, true);
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
