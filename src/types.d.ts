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
