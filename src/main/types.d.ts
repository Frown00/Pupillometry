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
  };
  measurement: {
    eye: 'left' | 'right' | 'both';
    baseline: {
      type: 'fromStart' | 'selected segment';
      param: number | string;
    };
    segmentation: 'scene' | 'time windows';
    windows?: {
      name: string;
      start: number;
      end: number;
    }[];
  };
  markers: {
    outOfRange: {
      min: number;
      max: number;
    };
    outOfDifference?: {
      max: number;
      fluctuation: number;
    };
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
    };
    temporallyIsolatedSamples: {
      on: boolean;
      sizeMinimum: number; // time within samples are valid numbers
      isolationMinimum: number; // gap from both sides
    };
  };
  trialValidity: {
    missing: number;
    correlation?: number;
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

interface IPupillometryStats {
  sample: {
    raw: number;
    valid: number;
    outlier: {
      name: string;
      count: number;
    }[];
  };
  result: {
    mean: number;
    min: number;
    max: number;
    std: number;
    difference: number;
    correlation: number;
    missing: number;
  };
  left: {
    mean: number;
    min: number;
    max: number;
    std: number;
    missing: number;
  };
  right: {
    mean: number;
    min: number;
    max: number;
    std: number;
    missing: number;
  };
}

/**
 * invalid -
 * missing - sample marked as missed by eyetracker
 * outlier - filter out by algorithms
 */
type PupilMark = 'missing' | 'invalid' | 'outlier';

type OutlierAlghorithm =
  | 'Dilatation Speed'
  | 'Dilatation Speed - Gap'
  | 'Trendline Deviation'
  | 'Temporal Isolated Island';
interface IPupilSample extends IPupilMarked {
  mean?: number;
  baselineSubstract?: number;
  baselineDivide?: number;
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
  meanMark?: 'upsampled' | 'downsampled';
}

type SegmentClass = 'Valid' | 'Invalid' | 'Wrong';

interface IBaselineInfo {
  value: number;
  substractStats: IPupillometryStats;
  divideStats: IPupillometryStats;
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
}

interface IPupillometryResult {
  name: string;
  segments: IPupillometry[];
  config: string;
  dataPath?: string;
}
