import { State } from './channels';

interface IMessage {
  state: State;
  progress: number;
  response: IStudyAnnotation[] | IStudy | IGroup | null | undefined | string;
}

interface IResponseGetStudyAnnotations extends IMessage {
  response: IStudyAnnotation[];
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
