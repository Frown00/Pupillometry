/* eslint-disable import/prefer-default-export */
export function mapFormValuesToConfig(values: IConfigFormValues): IConfig {
  return {
    name: values.name,
    file: {
      leftPupil: values.leftPupil,
      rightPupil: values.rightPupil,
      segmentActive: values.segmentActive,
      timestamp: values.timestamp,
      separator: values.separator,
    },
    chart: {
      width: values.width,
      height: values.height,
      showEyesPlot: values.showEyesPlot,
      showMeanPlot: values.showMeanPlot,
    },
    processing: {
      extraFilters: {
        dilatationSpeed: {
          on: values['dilatationSpeed.on'],
          thresholdMultiplier: values['dilatationSpeed.thresholdMultiplier'],
        },
        temporallyIsolatedSamples: {
          on: values['temporallyIsolatedSamples.on'],
          gap: values['temporallyIsolatedSamples.gap'],
          range: values['temporallyIsolatedSamples.range'],
        },
        trendLineDeviation: {
          on: values['trendLineDeviation.on'],
          maxJump: values['trendLineDeviation.maxJump'],
        },
      },
      interpolation: {
        on: values['interpolation.on'],
        acceptableGap: values.acceptableDifference,
      },
      pupil: {
        acceptableDifference: values.acceptableDifference,
        baseline: values.baseline,
        eye: values.eye,
        max: values.max,
        mean: values.mean,
        min: values.min,
      },
      resampling: {
        on: values['resampling.on'],
        rate: values['resampling.rate'],
      },
      segmentDivision: values.segmentDivision,
      smoothing: {
        cutoffFrequency: 4,
        on: true,
      },
      timeWindow: {
        on: values.timeWindow,
        windows: [],
      },
      validityConditions: {
        correlation: values['validity.correlation'],
        missing: {
          general: values['validity.missing.general'],
          left: values['validity.missing.left'],
          right: values['validity.missing.right'],
        },
      },
    },
  };
}
