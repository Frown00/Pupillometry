interface IConfig {
  name: string;
  file: {
    separator: string;
    timestamp: string;
    leftPupil: string;
    rightPupil: string;
    segmentActive: string;
  };
  chart: {
    width: number;
    height: number;
    showEyesPlot: boolean;
    showMeanPlot: boolean;
    showSmoothed: boolean;
    showRejected: PupilMark[];
  };
  measurement: {
    eye: 'left' | 'right' | 'both';
    baseline: {
      type: 'from Start' | 'selected segment';
      param: number | string;
    };
    segmentation: 'scene' | 'time windows';
    windows?: string[];
  };
  validity: {
    missing?: number;
    correlation?: number;
    difference?: number;
  };
  markers: {
    outOfRange: {
      min: number;
      max: number;
    };
    // outOfDifference?: {
    //   max: number;
    //   fluctuation: number;
    // };
    dilatationSpeed: {
      on: boolean;
      thresholdMultiplier: number;
      gapMinimumDuration: number;
      gapMaximumDuration: number;
      backwardGapPadding: number;
      forwardGapPadding: number;
    };
    trendlineDeviation: {
      on: boolean;
      thresholdMultiplier: number;
      cutoffFrequency: number;
      passes: number;
      gapMinimumDuration: number;
      gapMaximumDuration: number;
      backwardGapPadding: number;
      forwardGapPadding: number;
    };
    temporallyIsolatedSamples: {
      on: boolean;
      sizeMaximum: number; // time within samples are valid numbers
      isolationMinimum: number; // gap from both sides
    };
  };
  resampling: {
    on: boolean;
    rate: number; // Hz
    acceptableGap: number;
  };
  smoothing: {
    on: boolean;
    cutoffFrequency: number; // Hz
  };
}

interface IPupilSampleRaw {
  Timestamp: string;
  LeftPupil: string;
  RightPupil: string;
  SegmentActive: string;
}
interface IPupilSampleParsed {
  timestamp: number;
  leftPupil: number;
  rightPupil: number;
  segmentActive: string;
}

interface IPupilSamplePreprocessed extends IPupilSampleParsed {
  meanPupil: number;
  dilatationSpeed?: {
    left?: number;
    right?: number;
  };
}

interface IStats {
  mean: number;
  min: number;
  max: number;
  std: number;
}

interface IStatsWithMissing extends IStats {
  missing: number;
}

interface IPupillometryStats {
  sample: {
    raw: number;
    valid: number;
    outlier: {
      name: string;
      count: number;
    }[];
    difference: number;
    correlation: number;
    missing: number;
  };
  result: IStats;
  resultSmoothed: IStats;
  left: IStatsWithMissing;
  right: IStatsWithMissing;
}

/**
 * invalid -
 * missing - sample marked as missed by eyetracker
 * outlier - filter out by algorithms
 */
type PupilMark = 'missing' | 'invalid' | 'outliers';

type OutlierAlghorithm =
  | 'Dilatation Speed'
  | 'Dilatation Speed - Gap'
  | 'Trendline Deviation'
  | 'Temporal Isolated Island';
interface IPupilSample extends IPupilMarked {
  mean?: number;
  baselineMinus?: number;
  baselineDivide?: number;
  zscore?: number;
  zscoreMinusBaseline?: number;
  zscoreDivideBaseline?: number;
  relative?: number;
  erpd?: number;
}

interface IPupilMarked extends IPupilSampleParsed {
  leftMark?: {
    type: PupilMark;
    algorithm?: OutlierAlghorithm;
  };
  rightMark?: {
    type: PupilMark;
    algorithm?: OutlierAlghorithm;
  };
  meanMark?: 'upsampled' | 'downsampled' | 'binned';
}

type SegmentClass = 'Valid' | 'Invalid' | 'Wrong';

interface IBaselineInfo {
  value: number;
  minusStats: IPupillometryStats;
  divideStats: IPupillometryStats;
}

interface IZscore {
  standard: IPupillometryStats;
  minusBaseline: IPupillometryStats;
  divideBaseline: IPupillometryStats;
}

interface IPercentInfo {
  relative: IPupillometryStats;
  erpd: IPupillometryStats;
}
interface IPupillometry {
  samples: IPupilSample[];
  smoothed?: IPupilSample[];
  stats: IPupillometryStats;
  name: string;
  classification: SegmentClass;
  duration: number;
  sampleRate: number;
  baseline?: IBaselineInfo;
  zscore?: IZscore;
  percent?: IPercentInfo;
}

interface IGrandValue {
  normal: number;
  smoothed: number;
  corrected: {
    minus: {
      normal: number;
      smoothed: number;
    };
    divide: {
      normal: number;
      smoothed: number;
    };
  };
}

interface IPupillometryResult {
  name: string;
  segments: IPupillometry[];
  config: string;
  dataPath?: string;
  meanGrand?: IGrandValue;
  stdGrand?: IGrandValue;
}
