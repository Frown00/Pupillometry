interface IConfigFormValues {
  acceptableDifference: number;
  baseline: number;
  'dilatationSpeed.on': boolean;
  'dilatationSpeed.thresholdMultiplier': number;
  eye: 'left' | 'both' | 'right';
  width: number;
  height: number;
  'interpolation.acceptableGap': number;
  'interpolation.on': boolean;
  leftPupil: string;
  max: number;
  mean: boolean;
  min: number;
  name: string;
  'resampling.on': boolean;
  'resampling.rate': number;
  rightPupil: string;
  segmentActive: string;
  segmentDivision: boolean;
  separator: string;
  showEyesPlot: boolean;
  showMeanPlot: boolean;
  'temporallyIsolatedSamples.gap': number;
  'temporallyIsolatedSamples.on': boolean;
  'temporallyIsolatedSamples.range': number;
  timeWindow: boolean;
  timestamp: string;
  'trendLineDeviation.on': boolean;
  'trendLineDeviation.maxJump': number;
  'validity.correlation': number;
  'validity.missing.general': number;
  'validity.missing.left': number;
  'validity.missing.right': number;
  windows: string; // [name, start, end]
}
