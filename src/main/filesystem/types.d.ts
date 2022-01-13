interface IGroup {
  name: string;
  isDependant: boolean;
  respondents: IRespondentSamples[];
}

interface IStudy {
  name: string;
  groups: IGroup[];
}

interface IStudyAnnotation {
  name: string;
}

interface IStore {
  studyAnnotations: IStudyAnnotation[];
  studies: IStudy[];
  recent: string;
}
