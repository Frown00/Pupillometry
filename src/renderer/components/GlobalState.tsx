import { IPupillometryStats } from '../../main/pupillary/constants';

interface ISegment {
  name: string;
  stats: IPupillometryStats;
  validSamples: any;
}

interface IRespondent {
  name: string;
  segments: ISegment[];
  isValid?: boolean;
}

interface IGroup {
  name: string;
  isDependent: boolean;
  respondents: IRespondent[];
  stats: any;
}

interface IGlobalState {
  studies: {
    name: string;
  }[];
  currentStudy: {
    name: string;
    groups: IGroup[];
  } | null;
  currentGroup: IGroup | undefined;
}

const GlobalState: IGlobalState = {
  studies: [],
  currentStudy: null,
  currentGroup: undefined,
};

export default GlobalState;
