import { State } from './channels';

interface IMessage {
  state: State;
  progress: number;
  response:
    | IStudy[]
    | IStudy
    | IGroup
    | IRespondentSamples
    | IConfigMap
    | null
    | undefined
    | string;
}

interface IResponseGetStudies extends IMessage {
  response: IStudy[];
}

interface IResponseGetStudy extends IMessage {
  response: IStudy;
}

interface IResponseCreateStudy extends IMessage {
  response: string;
}

interface IResponseCreateGroup extends IMessage {
  response: IGroup;
}

interface IResponseAddRespondent extends IMessage {
  response: IGroup;
}

interface IResponseRespondentPupilData extends IMessage {
  response: IRespondentSamples;
}

interface IResponseGetConfigs extends IMessage {
  response: IConfigMap;
}
