/* eslint-disable class-methods-use-this */
import { sampleCorrelation, standardDeviation } from 'simple-statistics';
import * as outlier from './filter/outlier';
import * as dSpeed from './filter/dilatationSpeed';
import * as util from './util';

interface ISegmentRaw {
  raw: IPupilSampleRaw[];
  name: string;
}

export default class Preprocessing {
  private raw: IPupilSampleRaw[];

  private config: IConfig;

  private segmentsRaw: ISegmentRaw[];

  private segments: IPupillometry[];

  constructor(rawData: IPupilSampleRaw[], config: IConfig) {
    this.raw = rawData;
    this.config = config;
    this.segmentsRaw = [];
    this.segments = [];
  }

  process() {
    // split into segments
    const { processing } = this.config;
    if (processing.timeWindow?.on) this.splitIntoTimeWindows();
    else if (processing?.segmentDivision) this.splitIntoSegments();
    else this.segmentsRaw = [{ raw: this.raw, name: 'Entire Study' }];
    //
    for (let s = 0; s < this.segmentsRaw.length; s += 1) {
      const segmentFromFile = this.segmentsRaw[s];
      // console.log(
      //   `\n\nSEGMENT: ${segmentFromFile.name}\nLENGTH: ${segmentFromFile.raw.length}`
      // );
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
      };
      const parsedSegment = this.parseSegment(segmentFromFile, stats);
      this.dilatationSpeedFilter(parsedSegment);
      this.temporallyIsolatedSamples(parsedSegment);
      this.trendLineDeviation(parsedSegment);
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
    segment.stats.std = means.length ? standardDeviation(means) : -1;
    if (lefts.length > 1 && rights.length > 1)
      segment.stats.pupilCorrelation = sampleCorrelation(lefts, rights);
    else segment.stats.pupilCorrelation = 1;
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
    const {
      processing: { pupil },
    } = this.config;
    const outliers = {
      acceptableDifference: 0,
    };
    for (let i = 0; i < processingData.length; i += 1) {
      if (i === processingData.length) break;
      const rowRaw = processingData[i];
      const row: IPupilSamplePreprocessed = {
        leftPupil: Number(rowRaw.LeftPupil),
        rightPupil: Number(rowRaw.RightPupil),
        timestamp: Number(rowRaw.Timestamp),
        segmentActive: rowRaw.SegmentActive,
        meanPupil: 0,
      };
      if (this.isMissing(row, 'left')) {
        row.leftPupil = NaN;
      }
      if (this.isMissing(row, 'right')) {
        row.rightPupil = NaN;
      }
      if (
        !outlier.isAcceptableDifference(
          row.leftPupil,
          row.rightPupil,
          pupil.acceptableDifference
        )
      ) {
        outliers.acceptableDifference += 1;
        row.leftPupil = NaN;
        row.rightPupil = NaN;
      }

      preprocessed.push(row);
    }
    console.log('AD:', outliers);
    const segment: IPupillometry = {
      name: segmentName,
      stats,
      validSamples: preprocessed,
      isValid: true, // TODO
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
    const outliners = {
      left: 0,
      right: 0,
      both: 0,
    };
    // segment.stats.dilatationSpeed.left = dilatationSeries.left;
    // segment.stats.dilatationSpeed.right = dilatationSeries.right;
    console.log('THRESHOLD', threshold);
    for (let i = 0; i < segment.validSamples.length; i += 1) {
      const row = segment.validSamples[i];
      const leftLowThanThreshold = outlier.isDilatationSpeedInThreshold(
        row.dilatationSpeed?.left,
        threshold.left
      );
      if (row.dilatationSpeed === {}) {
        row.leftPupil = NaN;
        row.rightPupil = NaN;
      }
      if (!leftLowThanThreshold) {
        row.leftPupil = NaN;
        outliners.left += 1;
      }
      const rightLowThanThreshold = outlier.isDilatationSpeedInThreshold(
        row.dilatationSpeed?.right,
        threshold.right
      );
      if (!rightLowThanThreshold) {
        row.rightPupil = NaN;
        outliners.right += 1;
      }
      if (row.rightPupil && row.leftPupil) {
        outliners.both += 1;
      }
      delete row.dilatationSpeed;
    }
    console.log('DS Outliners: ', outliners);
  }

  private temporallyIsolatedSamples(segment: IPupillometry) {
    const { processing } = this.config;
    const { temporallyIsolatedSamples } = processing.extraFilters;
    if (!temporallyIsolatedSamples.on) return;
    let isolatedLeft = [];
    let isolatedRight = [];
    const { gap, range } = temporallyIsolatedSamples;
    const samples = segment.validSamples;
    const outliers = {
      left: 0,
      right: 0,
    };
    for (let i = 0; i < samples.length; i += 1) {
      const row = samples[i];
      const previousLeft =
        util.findPreviousSamples(samples, i, 1, 'left')[0] || row;
      const previousRight =
        util.findPreviousSamples(samples, i, 1, 'right')[0] || row;
      const timeDiffLeft = row.timestamp - previousLeft.timestamp;
      const timeDiffRight = row.timestamp - previousRight.timestamp;

      // Left Pupil
      if (timeDiffLeft > gap) {
        isolatedLeft.push(row);
      } else if (isolatedLeft.length >= 2) {
        const start = isolatedLeft[0].timestamp;
        const end = isolatedLeft[isolatedLeft.length - 1].timestamp;
        const diff = end - start;
        if (diff <= range) {
          outliers.left += isolatedLeft.length;
          for (let r = 0; r < isolatedLeft.length; r += 1) {
            isolatedLeft[r].leftPupil = NaN;
          }
        }
        isolatedLeft = [];
      }
      // Right pupil
      if (timeDiffRight > gap) {
        isolatedRight.push(row);
      } else if (isolatedRight.length >= 2) {
        const start = isolatedRight[0].timestamp;
        const end = isolatedRight[isolatedRight.length - 1].timestamp;
        const diff = end - start;
        if (diff <= range) {
          outliers.right += isolatedRight.length;
          for (let r = 0; r < isolatedRight.length; r += 1) {
            isolatedRight[r].rightPupil = NaN;
          }
        }
        isolatedRight = [];
      }
    }
    console.log('TIS Outliers: ', outliers);
  }

  private trendLineDeviation(segment: IPupillometry) {
    const { processing } = this.config;
    const { trendLineDeviation } = processing.extraFilters;
    if (!trendLineDeviation.on) return;
    const { maxJump } = trendLineDeviation;
    const samples = segment.validSamples;
    const outliers = {
      left: 0,
      right: 0,
    };
    for (let i = 0; i < samples.length; i += 1) {
      const row = samples[i];
      const previousLeft =
        util.findPreviousSamples(samples, i, 1, 'left')[0] || row;
      const previousRight =
        util.findPreviousSamples(samples, i, 1, 'right')[0] || row;
      const valueDiffLeft = Math.abs(previousLeft.leftPupil - row.leftPupil);
      const valueDiffRight = Math.abs(
        previousRight.rightPupil - row.rightPupil
      );

      // Left Pupil
      if (valueDiffLeft > maxJump) {
        row.leftPupil = NaN;
        outliers.left += 1;
      }
      if (valueDiffRight > maxJump) {
        row.rightPupil = NaN;
        outliers.right += 1;
      }
    }
    console.log('TLD Outliers: ', outliers);
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

  private splitIntoSegments() {
    let currentSegment: ISegmentRaw = {
      raw: [],
      name: '',
    };
    let startTimestamp = '';
    for (let i = 0; i < this.raw.length; i += 1) {
      const row = this.raw[i];
      const segmentActive = row.SegmentActive.trim();
      if (segmentActive) {
        // Starting
        if (currentSegment.name === '') {
          currentSegment.name = segmentActive;
          startTimestamp = row.Timestamp;
        }
        // Push data to segment
        if (currentSegment.name === segmentActive) {
          currentSegment.name = segmentActive;
          row.Timestamp = (
            parseInt(row.Timestamp, 10) - parseInt(startTimestamp, 10)
          ).toString();
          currentSegment.raw.push(row);
        } else {
          // Ending segment
          if (currentSegment.raw.length > 0)
            this.segmentsRaw.push(currentSegment);
          // start new and push
          currentSegment = { raw: [], name: '' };
          currentSegment.name = segmentActive;
          startTimestamp = row.Timestamp;
          row.Timestamp = (
            parseInt(row.Timestamp, 10) - parseInt(startTimestamp, 10)
          ).toString();
          currentSegment.raw.push(row);
        }
      }
    }
    // console.log(this.segmentsRaw);
  }
}
