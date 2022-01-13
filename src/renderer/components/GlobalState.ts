interface IGlobalState {
  studyAnnotations: IStudyAnnotation[];
  currentStudy: IStudy | undefined;
  currentGroup: IGroup | undefined;
}

const GlobalState: IGlobalState = {
  studyAnnotations: [],
  currentStudy: undefined,
  currentGroup: undefined,
};

export default GlobalState;
