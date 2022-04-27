interface IGroup {
  name: string;
  isDependant: boolean;
  respondents: IPupillometryResult[];
}

interface IStudy {
  name: string;
  groups: IGroup[];
}

interface IConfigMap {
  [config: string]: IConfig;
}

interface ITaskGroup {
  name: string;
  tasks: string[];
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
