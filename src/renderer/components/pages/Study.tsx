import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  IStudyRequest,
  IStudyResponse,
} from '../../../ipc/channels/StudyChannel';
import { activeGroupState, activeStudyState } from '../../assets/state';
import { Routes } from '../../routes';
import { removeElement } from '../../../util';
import ButtonGroup from '../molecules/ButtonGroup';
import RouteLink from '../atoms/RouteLink';
import Button from '../atoms/Button';
import GroupTable, { IGroupRecord } from '../organisms/table/GroupTable';
import Title from '../atoms/Title';
import ActiveStudy from '../templates/ActiveStudy';
import DefaultLoader from '../atoms/Loader';
import IpcService from '../../IpcService';
import { State } from '../../../ipc/interfaces';

interface MatchParams {
  studyName: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

export default function Study(props: MatchProps) {
  const [isLoading, setLoading] = useState(false);
  const [activeStudy, setActiveStudy] = useRecoilState(activeStudyState);
  const [activeGroup, setActiveGroup] = useRecoilState(activeGroupState);

  useEffect(() => {
    // activate
    const { match } = props;
    const request: IStudyRequest = {
      method: 'readOne',
      query: {
        name: match.params.studyName,
      },
    };
    const responseChannel = IpcService.send('study', request);
    IpcService.on(responseChannel, (_, response: IStudyResponse) => {
      if (response.state === State.Loading) {
        setLoading(true);
        return;
      }
      setLoading(false);
      setActiveStudy(response.result);
      setActiveGroup(response.result.groups?.[0] ?? ({} as IGroup));
    });
    return () => {
      IpcService.removeAllListeners(responseChannel);
    };
  }, [props, setActiveStudy, setActiveGroup, activeGroup.name]);

  const handleOnDelete = (record: IGroupRecord) => {
    const { match } = props;
    const { studyName } = match.params;
    const { groups } = activeStudy;
    const request: IStudyRequest = {
      method: 'deleteOne',
      query: {
        name: studyName,
        group: record.name,
        select: 'group',
      },
    };
    const responseChannel = IpcService.send('study', request);
    IpcService.on(responseChannel, () => {
      const groupsCopy = [...groups];
      removeElement(groupsCopy, 'name', record.name);
      setActiveStudy((prev) => ({ ...prev, groups: groupsCopy }));
    });
  };

  const { match, history } = props;
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
          onClick={() => history.push(Routes.Export(activeStudy.name))}
          type="default"
        >
          Export
        </Button>
      </ButtonGroup>
      <Title level={2}>All Groups</Title>
      <GroupTable
        studyName={studyName}
        groups={activeStudy?.groups ?? []}
        handleOnDelete={handleOnDelete}
      />
    </ActiveStudy>
  );
}
