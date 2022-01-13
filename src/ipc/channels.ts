/* eslint-disable import/prefer-default-export */
export enum Channel {
  ProcessPupil = 'process-pupil-samples',
  GetStoreValue = 'get-store-value',
  SetStoreValue = 'set-store-value',
  Request = 'request',
  RequestStudies = 'request-studies',
  GetStudy = 'get-study',
  GetStudyAnnotations = 'get-study-annotations',
  CreateStudy = 'create-study',
  DeleteStudy = 'delete-study',
  CreateGroup = 'create-group',
  DeleteGroup = 'delete-group',
  GetValidPupilSamples = 'get-valid-pupil-samples',
  ClearDB = 'clear-db',
}

export enum State {
  Loading = 'loading',
  Done = 'done',
}
