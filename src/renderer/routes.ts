/* eslint-disable import/prefer-default-export */
export const Routes = {
  Starting: '/',
  About: '/about',
  Config: '/config',
  Test: '/test',
  Study: (name = ':studyName') => `/study/${name}`,
  Group: (studyName = ':studyName', groupName = ':groupName') =>
    `/study/${studyName}/${groupName}`,
  Respondent: (
    studyName = ':studyName',
    groupName = ':groupName',
    respondentName = ':respondentName'
  ) => `/study/${studyName}/${groupName}/${respondentName}`,
  NewStudy: '/form/newStudy',
  NewGroup: (studyName = ':studyName') => `/form/${studyName}/newGroup`,
  AddRespondent: (studyName = ':studyName', groupName = ':groupName') =>
    `/form/${studyName}/${groupName}/addRespondent`,
  Export: (studyName = ':studyName') => `/export/study/${studyName}`,
};
