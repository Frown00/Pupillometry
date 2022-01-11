/* eslint-disable class-methods-use-this */
import { sampleCorrelation, standardDeviation } from 'simple-statistics';
import {
  IPupilSamplePreprocessed,
  IPupilSampleRaw,
  IPupillometryStats,
  IPupillometry,
} from './constants';
import * as outlier from './filter/outlier';
import * as dSpeed from './filter/dilatationSpeed';
import * as util from './util';

export default class Preprocessing {
  private raw: IPupilSampleRaw[];

  private processing: IPupilSamplePreprocessed[];

  private config: IConfig;

  private segmentsRaw: { raw: IPupilSampleRaw[]; name: string }[];

  private segments: IPupillometry[];

  constructor(rawData: IPupilSampleRaw[], config: IConfig) {
    this.raw = rawData;
    this.config = config;
    this.processing = [];
    this.segmentsRaw = [];
    this.segments = [];
  }

  process() {
    // split into segments
    const { processing } = this.config;
    if (processing.timeWindow?.on) this.splitIntoTimeWindows();
    else this.segmentsRaw = [{ raw: this.raw, name: 'Entire Study' }];
    //
    for (let s = 0; s < this.segmentsRaw.length; s += 1) {
      const segmentFromFile = this.segmentsRaw[s];
      const stats: IPupillometryStats = {
        rawSamplesCount: this.raw.length,
        validSamples: 0,
        missing: {
          general: 0,
          leftPupil: 0,
          rightPupil: 0,
        },
        mean: 0,
        meanPupilDifference: 0,
        pupilCorrelation: 0,
        min: Infinity,
        max: -Infinity,
        std: 0,
        dilatationSpeed: { left: [], right: [] },
      };
      const parsedSegment = this.parseSegment(segmentFromFile, stats);
      this.dilatationSpeedFilter(parsedSegment);
      this.calcStats(parsedSegment);
      this.segments.push(parsedSegment);
    }
    return this.segments;
  }

  private calcStats(segment: IPupillometry) {
    let dynamicDiffLP = 0;
    let meanSum = 0;
    let diffSum = 0;
    const means = [];
    const lefts: number[] = [];
    const rights: number[] = [];
    for (let i = 0; i < segment.validSamples.length; i += 1) {
      // calc dynamic offset (eye difference)
      const sample = segment.validSamples[i];
      const nextDiff = sample.leftPupil - sample.rightPupil;
      if (nextDiff) {
        dynamicDiffLP = nextDiff;
        diffSum += Math.abs(nextDiff);
      }
      // Calc mean
      sample.meanPupil = util.calcMean(
        sample.leftPupil,
        sample.rightPupil,
        dynamicDiffLP
      );
      if (Number.isNaN(sample.leftPupil)) segment.stats.missing.leftPupil += 1;
      if (Number.isNaN(sample.rightPupil))
        segment.stats.missing.rightPupil += 1;

      if (sample.meanPupil > 0) {
        segment.stats.validSamples += 1;
        meanSum += sample.meanPupil;
        means.push(sample.meanPupil);
        if (
          !Number.isNaN(sample.leftPupil) &&
          !Number.isNaN(sample.rightPupil)
        ) {
          lefts.push(sample.leftPupil);
          rights.push(sample.rightPupil);
        }
        // Calc min
        segment.stats.min =
          segment.stats.min < sample.meanPupil
            ? segment.stats.min
            : sample.meanPupil;
        // Calc max
        segment.stats.max =
          segment.stats.max > sample.meanPupil
            ? segment.stats.max
            : sample.meanPupil;
      } else {
        segment.stats.missing.general += 1;
        segment.validSamples.splice(i, 1);
        i -= 1;
      }
    }
    segment.stats.mean = meanSum / segment.stats.validSamples;
    segment.stats.meanPupilDifference = diffSum / segment.stats.validSamples;
    segment.stats.std = standardDeviation(means);
    segment.stats.pupilCorrelation = sampleCorrelation(lefts, rights);
    // sergment.stats.variance = variance(means);
  }

  private parseSegment(
    segmentFromFile: { raw: IPupilSampleRaw[]; name: string },
    stats: IPupillometryStats
  ) {
    stats.rawSamplesCount = segmentFromFile.raw.length;
    const processingData = segmentFromFile.raw;
    const segmentName = segmentFromFile.name;
    const preprocessed = [];
    for (let i = 0; i < processingData.length; i += 1) {
      if (i === processingData.length) break;
      const rowRaw = processingData[i];
      const row: IPupilSamplePreprocessed = {
        leftPupil: Number(rowRaw.LeftPupil),
        rightPupil: Number(rowRaw.RightPupil),
        timestamp: Number(rowRaw.Timestamp),
        segmentId: rowRaw.SegmentId,
        meanPupil: 0,
      };
      if (this.isMissing(row, 'left')) {
        row.leftPupil = NaN;
      }
      if (this.isMissing(row, 'right')) {
        row.rightPupil = NaN;
      }
      preprocessed.push(row);
    }
    const segment: IPupillometry = {
      name: segmentName,
      stats,
      validSamples: preprocessed,
    };
    return segment;
  }

  private isMissing(row: IPupilSamplePreprocessed, eye: 'left' | 'right') {
    const { processing } = this.config;
    const pupilSize = eye === 'left' ? row.leftPupil : row.rightPupil;
    const isMarkedAsCorrect = outlier.isETMarkedAsCorrect(pupilSize);
    const inRange = outlier.inRange(
      pupilSize,
      processing.pupil.min,
      processing.pupil.max
    );
    if (!isMarkedAsCorrect) return true;
    if (!inRange) return true;
    return false;
  }

  private dilatationSpeedFilter(segment: IPupillometry) {
    // Dilatation Speed Outlier Filter
    const { processing } = this.config;
    const { dilatationSpeed } = processing.extraFilters;
    if (!dilatationSpeed.on) return;
    const dilatationSeries = dSpeed.setDilatationSpeed(segment.validSamples);
    const threshold = {
      left: dSpeed.calcThreshold(
        dilatationSpeed.thresholdMultiplier,
        dilatationSeries.left
      ),
      right: dSpeed.calcThreshold(
        dilatationSpeed.thresholdMultiplier,
        dilatationSeries.right
      ),
    };
    segment.stats.dilatationSpeed.left = dilatationSeries.left;
    segment.stats.dilatationSpeed.right = dilatationSeries.right;
    console.log('THRESHOLD', threshold);
    for (let i = 0; i < segment.validSamples.length; i += 1) {
      const row = segment.validSamples[i];
      const leftLowThanThreshold = outlier.isDilatationSpeedInThreshold(
        row.dilatationSpeed?.left,
        threshold.left
      );
      if (!leftLowThanThreshold) {
        row.leftPupil = NaN;
      }
      const rightLowThanThreshold = outlier.isDilatationSpeedInThreshold(
        row.dilatationSpeed?.right,
        threshold.right
      );
      if (!rightLowThanThreshold) {
        row.rightPupil = NaN;
      }
    }
  }

  private splitIntoTimeWindows() {
    const { processing } = this.config;
    for (let w = 0; w < processing.timeWindow.windows.length; w += 1) {
      const fragment = processing.timeWindow.windows[w];
      const data = [];
      for (let i = 0; i < this.raw.length; i += 1) {
        if (Number(this.raw[i].Timestamp) >= fragment.end) break;
        if (Number(this.raw[i].Timestamp) >= fragment.start) {
          data.push(this.raw[i]);
        }
      }
      this.segmentsRaw.push({ raw: data, name: fragment.name });
    }
  }
}
