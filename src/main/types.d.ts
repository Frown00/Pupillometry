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
    curve?: {
      type:
        | 'linear'
        | 'basis'
        | 'bundle'
        | 'cardinal'
        | 'natural'
        | 'step'
        | 'stepAfter'
        | 'stepBefore';
      parameter?: number;
    };
  };
  processing: {
    pupil: {
      eye: 'left' | 'right' | 'both';
      mean: boolean; // chart includes mean based on selected eye
      // TODO
      baseline: number; // mm
      min: number; // mm
      max: number; // mm
      acceptableDifference: number; // mm
    };
    extraFilters: {
      dilatationSpeed: {
        on: boolean;
        thresholdMultiplier: number;
      };
      trendLineDeviation: {
        on: boolean;
        maxJump: number;
      };
      temporallyIsolatedSamples: {
        on: boolean;
        range: number; // time within samples are valid numbers
        gap: number; // gap from both sides
      };
    };
    // TODO
    resampling: {
      on: boolean;
      rate: number; // Hz
    };
    interpolation: {
      on: boolean;
      // TODO
      acceptableGap: number; // ms
    };
    // TODO
    smoothing: {
      on: boolean;
      cutoffFrequency: number; // Hz
    };
    segmentDivision: boolean;
    timeWindow: {
      on: boolean;
      windows: {
        name: string;
        start: number;
        end: number;
      }[];
    };
    validityConditions: {
      missing?: {
        general?: number;
        left?: number;
        right?: number;
      };
      correlation?: number;
    };
  };
}

interface IPupilSamplePreprocessed {
  timestamp: number;
  leftPupil: number;
  rightPupil: number;
  meanPupil: number;
  segmentActive: string;
  dilatationSpeed?: {
    left?: number;
    right?: number;
  };
}

interface IPupilSampleRaw {
  Timestamp: string;
  LeftPupil: string;
  RightPupil: string;
  SegmentActive: string;
}

interface IPupillometryStats {
  rawSamplesCount: number;
  validSamples: number;
  missing: {
    general: number;
    leftPupil: number;
    rightPupil: number;
  };
  mean: number;
  meanPupilDifference: number;
  pupilCorrelation: number;
  min: number;
  max: number;
  std: number;
  left: {
    mean: number;
    min: number;
    max: number;
    std: number;
  };
  right: {
    mean: number;
    min: number;
    max: number;
    std: number;
  };
}

interface IPupillometry {
  validSamples: IPupilSamplePreprocessed[];
  stats: IPupillometryStats;
  name: string;
  isValid: boolean;
}

interface IRespondentSamples {
  name: string;
  segments: IPupillometry[];
  config: string;
  dataPath?: string;
}
