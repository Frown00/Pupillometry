import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  activeGroupState,
  activeStudyState,
  configsState,
  studiesState,
} from '../../assets/state';
import { Routes } from '../../constants';
import { removeElement } from '../../../util';
import ElectronWindow from '../../ElectronWindow';
import { Channel, State } from '../../../ipc/channels';
import { IResponseGetStudy } from '../../../ipc/types';
import ButtonGroup from '../molecules/ButtonGroup';
import RouteLink from '../atoms/RouteLink';
import Button from '../atoms/Button';
import GroupTable, { IGroupRecord } from '../organisms/table/GroupTable';
import Title from '../atoms/Title';
import ActiveStudy from '../templates/ActiveStudy';
import DefaultLoader from '../atoms/Loader';

interface MatchParams {
  studyName: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

interface IState {
  isLoading: boolean;
  study: IStudy | null | undefined;
  groups: IGroup[];
}
const { ipcRenderer } = ElectronWindow.get().api;

export default function Study(props: MatchProps) {
  const [state, setState] = useState<IState>({
    isLoading: true,
    study: null,
    groups: [],
  });
  const [, setActiveStudy] = useRecoilState(activeStudyState);
  const [activeGroup, setActiveGroup] = useRecoilState(activeGroupState);

  useEffect(() => {
    // activate
    const { match } = props;
    const form: IRequestForm = { studyName: match.params.studyName };
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.GetStudy,
      form,
    });
    ipcRenderer.on(Channel.GetStudy, (message: IResponseGetStudy) => {
      if (message.state === State.Loading) {
        setState((prev) => ({ ...prev, isLoading: true }));
      } else {
        setState({
          isLoading: false,
          study: message.response,
          groups: message.response?.groups ?? [],
        });
        setActiveStudy(message.response);
        if (!activeGroup?.name)
          setActiveGroup(message.response.groups?.[0] ?? ({} as IGroup));
      }
    });
    return () => {
      ipcRenderer.removeAllListeners(Channel.GetStudy);
    };
  }, [props, setActiveStudy, setActiveGroup, activeGroup.name]);

  const handleOnDelete = (record: IGroupRecord) => {
    const { match } = props;
    const { studyName } = match.params;
    const { groups } = state;
    const groupsCopy = [...groups];
    const removed = removeElement(groupsCopy, 'name', record.name);
    const deleteForm: IDeleteGroup = {
      groupName: removed.name,
      studyName,
    };
    ipcRenderer.send(Channel.DeleteGroup, deleteForm);
    setState((prev) => ({ ...prev, groups: groupsCopy }));
  };

  const { match } = props;
  const { isLoading, groups } = state;
  const { studyName } = match.params;
  const loader = isLoading ? <DefaultLoader /> : undefined;

  return (
    <ActiveStudy routerProps={props} Loader={loader}>
      <ButtonGroup>
        <RouteLink
          to={Routes.NewGroup(studyName)}
          Wrapper={() => <Button type="primary">New Group</Button>}
        />
        <Button
          onClick={() =>
            ipcRenderer.send(Channel.ExportMetrics, {
              name: studyName,
              groups: [],
            })
          }
          type="default"
        >
          Export
        </Button>
      </ButtonGroup>
      <Title level={2}>All Groups</Title>
      <GroupTable
        studyName={studyName}
        groups={groups}
        handleOnDelete={handleOnDelete}
      />
    </ActiveStudy>
  );
}
