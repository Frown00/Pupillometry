/* eslint-disable import/prefer-default-export */
export const PupilStandardHeaders = {
  TIMESTAMP: 'Timestamp',
  LEFT_PUPIL: 'LeftPupil',
  RIGHT_PUPIL: 'RightPupil',
  SEGMENT_ID: 'SegmentId',
};

export interface IPupilSamplePreprocessed {
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

export interface IPupilSampleRaw {
  Timestamp: string;
  LeftPupil: string;
  RightPupil: string;
  SegmentId: string;
}

export interface IPupillometryStats {
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

export interface IPupillometry {
  validSamples: IPupilSamplePreprocessed[];
  stats: IPupillometryStats;
  name: string;
}

export interface IRespondentSamples {
  name: string;
  segments: IPupillometry[];
}
