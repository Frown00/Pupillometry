interface IConfig {
  file: {
    separator: string;
    timestamp: string;
    leftPupil: string;
    rightPupil: string;
    segmentId: string;
  };
  chart: {
    width: number;
    height: number;
    showEyesPlot: boolean;
    showMeanPlot: boolean;
  };
  processing: {
    pupil: {
      eye: 'left' | 'right' | 'both';
      mean: boolean; // chart includes mean based on selected eye
      // TODO
      baseline: number; // mm
      min: number; // mm
      max: number; // mm
      // TODO
      acceptableDifference: number; // mm
    };
    extraFilters: {
      dilatationSpeed: {
        on: boolean;
        thresholdMultiplier: number;
      };
      // TODO
      trendLineDeviation: {
        on: boolean;
        maxJump: number;
      };
      // TODO
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
    timeWindow: {
      on: boolean;
      windows: {
        name: string;
        start: number;
        end: number;
      }[];
    };
  };
}

interface IPupilSamplePreprocessed {
  timestamp: number;
  leftPupil: number;
  rightPupil: number;
  meanPupil: number;
  segmentId: string;
  dilatationSpeed?: {
    left?: number;
    right?: number;
  };
}

interface IPupilSampleRaw {
  Timestamp: string;
  LeftPupil: string;
  RightPupil: string;
  SegmentId: string;
}

interface IPupillometryStats {
  dilatationSpeed: {
    left: number[];
    right: number[];
  };
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
}

interface IPupillometry {
  validSamples: IPupilSamplePreprocessed[];
  stats: IPupillometryStats;
  name: string;
}

interface IRespondentSamples {
  name: string;
  segments: IPupillometry[];
}
