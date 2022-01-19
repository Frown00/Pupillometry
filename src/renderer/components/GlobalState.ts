interface IGlobalState {
  studies: IStudy[];
  currentStudy: IStudy | undefined;
  currentGroup: IGroup | undefined;
  configs: IConfigMap;
}

const GlobalState: IGlobalState = {
  studies: [],
  currentStudy: undefined,
  currentGroup: undefined,
  configs: {},
};

export default GlobalState;
