interface IGlobalState {
  studies: IStudy[];
  currentStudy: IStudy | undefined;
  currentGroup: IGroup | undefined;
}

const GlobalState: IGlobalState = {
  studies: [],
  currentStudy: undefined,
  currentGroup: undefined,
};

export default GlobalState;
