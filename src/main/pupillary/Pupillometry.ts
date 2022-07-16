/* eslint-disable no-underscore-dangle */
import parser from './lib/parser';
import Segment from './Segment';
import segmentation from './lib/segmentation';
import EyeTrackerMarker from './markers/EyeTrackerMarker';
import OutOfRangeMarker from './markers/OutOfRangeMarker';
import DilationSpeedMarker from './markers/DilationSpeedMarker';
import GrandStatsHelper from './lib/GrandStatsHelper';
import TrendlineDeviationMarker from './markers/TrendlineDeviationMarker';
import TemporallyIsolatedMarker from './markers/TemporallyIsolatedMarker';

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
    const { resampling, smoothing } = this.#config;
    const allMarkers: IMarker[] = this.usedMarkers();
    const toOmit: PupilMark[] = ['missing', 'outliers', 'invalid'];
    const baselineSegmentName = name;
    const isChartContinous = !resampling.acceptableGap;
    const baselineSegment = this.#segments.find(
      (s) =>
        s.name.toLowerCase().trim() === baselineSegmentName.toLowerCase().trim()
    );
    if (!baselineSegment) return NaN;
    const { stats } = baselineSegment
      .markOutliers(allMarkers)
      .omitMarked(toOmit)
      .calcBeforeReshape(isChartContinous)
      .resampling(resampling.on, resampling.rate, resampling.acceptableGap)
      .smoothing(smoothing.on, smoothing.cutoffFrequency)
      .calcResultStats()
      .getInfo();
    return smoothing.on ? stats.resultSmoothed.mean : stats.result.mean;
  }

  test(): IPupillometryResult {
    return this.cleanAndCount(false);
  }

  process(): IPupillometryResult {
    return this.cleanAndCount(true);
  }

  private cleanAndCount(isReducedToOneLineGraph: boolean) {
    const { resampling, smoothing, measurement, validity, chart } =
      this.#config;
    const allMarkers: IMarker[] = this.usedMarkers();
    const toOmit: PupilMark[] = chart.showRejected
      ? <PupilMark[]>(
          ['missing', 'outliers', 'invalid'].filter(
            (m) => !chart.showRejected.includes(m as PupilMark)
          )
        )
      : ['missing', 'outliers', 'invalid'];
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
      // skip baseline segment
      // eslint-disable-next-line no-continue
      if (baseOnSegment && baselineConfig.param === segment.name) continue;
      segment
        .selectData(measurement.eye)
        .markOutliers(allMarkers)
        .omitMarked(toOmit)
        .calcBeforeReshape(isChartContinous)
        .resampling(resampling.on, resampling.rate, resampling.acceptableGap)
        .smoothing(smoothing.on, smoothing.cutoffFrequency)
        .setBaseline({
          evaluatedBaseline: baseline,
          baselineWindowSize: Number(baselineConfig.param),
        })
        .calcResultStats(smoothing.on)
        .validity(validity.missing, validity.correlation, validity.difference);

      const { stats, baseline: corrected } = segment.getInfo();
      grandHelperMean.add(stats, corrected);
      grandHelperStd.add(stats, corrected);
    }

    const meanGrand: IGrandValue = grandHelperMean.calc();
    const stdGrand: IGrandValue = grandHelperStd.calc();

    for (let i = 0; i < this.#segments.length; i += 1) {
      const segment = this.#segments[i];
      segment.calcAdvancedMeasures(smoothing.on, meanGrand, stdGrand);
      if (isReducedToOneLineGraph) segment.reduce(smoothing.on, true);
    }

    return {
      name: this.#name,
      segments: this.#segments.map((s) => s.getInfo()),
      config: this.#config.name,
      meanGrand,
      stdGrand,
    };
  }

  private usedMarkers() {
    const { markers } = this.#config;
    const {
      outOfRange,
      dilatationSpeed,
      trendlineDeviation,
      temporallyIsolatedSamples,
    } = markers;
    const allMarkers: IMarker[] = [
      new EyeTrackerMarker(),
      new OutOfRangeMarker(outOfRange.min, outOfRange.max),
    ];
    if (dilatationSpeed.on) {
      const {
        thresholdMultiplier,
        gapMinimumDuration,
        gapMaximumDuration,
        backwardGapPadding,
        forwardGapPadding,
      } = dilatationSpeed;
      allMarkers.push(
        new DilationSpeedMarker(thresholdMultiplier, {
          min: gapMinimumDuration,
          max: gapMaximumDuration,
          padding: {
            backward: backwardGapPadding,
            forward: forwardGapPadding,
          },
        })
      );
    }
    if (trendlineDeviation.on) {
      const {
        passes,
        cutoffFrequency,
        thresholdMultiplier,
        gapMinimumDuration,
        gapMaximumDuration,
        backwardGapPadding,
        forwardGapPadding,
      } = trendlineDeviation;
      const gap = {
        min: gapMinimumDuration,
        max: gapMaximumDuration,
        padding: {
          backward: backwardGapPadding,
          forward: forwardGapPadding,
        },
      };

      allMarkers.push(
        new TrendlineDeviationMarker(
          passes,
          thresholdMultiplier,
          gap,
          cutoffFrequency
        )
      );
    }
    if (temporallyIsolatedSamples.on) {
      const { isolationMinimum, sizeMaximum } = temporallyIsolatedSamples;
      allMarkers.push(
        new TemporallyIsolatedMarker(sizeMaximum, isolationMinimum)
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
