interface IGroup {
  name: string;
  isDependant: boolean;
  respondents: IRespondentSamples[];
}

interface IStudy {
  name: string;
  groups: IGroup[];
}

interface IConfigMap {
  [config: string]: IConfig;
}

interface IStore {
  recent: string;
  studies: IStudy[];
  configs: IConfigMap;
  defaultConfig: string;
}

interface IRequestForm {
  studyName?: string;
  groupName?: string;
  respondentName?: string;
  files?: { path: string }[];
  isDependant?: boolean;
  config?: IConfig;
}

interface IDeleteStudy {
  studyName: string;
}

interface IDeleteGroup {
  studyName: string;
  groupName: string;
}

interface IDeleteRespondent {
  studyName: string;
  groupName: string;
  respondentName: string;
}
