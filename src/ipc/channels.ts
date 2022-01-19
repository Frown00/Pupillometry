/* eslint-disable import/prefer-default-export */
export enum Channel {
  GetConfigs = 'get-configs',
  CreateConfig = 'create-config',
  ProcessPupil = 'process-pupil-samples',
  GetStoreValue = 'get-store-value',
  SetStoreValue = 'set-store-value',
  Request = 'request',
  RequestStudies = 'request-studies',
  GetStudy = 'get-study',
  GetStudies = 'get-studies',
  CreateStudy = 'create-study',
  DeleteStudy = 'delete-study',
  CreateGroup = 'create-group',
  DeleteGroup = 'delete-group',
  AddRespondent = 'add-respondent',
  GetRespondentPupilData = 'get-respondent-pupil-data',
  DeleteRespondent = 'delete-respondent',
  GetValidPupilSamples = 'get-valid-pupil-samples',
  ExportMetrics = 'export-metrics',
  ClearDB = 'clear-db',
}

export enum State {
  Loading = 'loading',
  Done = 'done',
}
