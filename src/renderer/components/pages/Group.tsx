import { Button, Select, Space } from 'antd';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { Routes } from '../../routes';
import { activeGroupState, activeStudyState } from '../../assets/state';
import { removeElement } from '../../../util';
import ActiveStudy from '../templates/ActiveStudy';
import RouteLink from '../atoms/RouteLink';
import Title from '../atoms/Title';
import Text from '../atoms/Text';
import RespondentTable, {
  IRespondentRecord,
} from '../organisms/table/RespondentTable';
import IpcService from '../../IpcService';
import { IStudyRequest } from '../../../ipc/channels/StudyChannel';
import ButtonGroup from '../molecules/ButtonGroup';

interface MatchParams {
  studyName: string;
  groupName: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

function getAllUniqueTasks(respondents: IPupillometryResult[]) {
  const taskNames = new Set<string>();
  for (let i = 0; i < respondents?.length; i += 1) {
    const r = respondents[i];
    r.segments.map((s) => taskNames.add(s.name));
  }
  return Array.from(taskNames);
}

export default function Group(props: MatchProps) {
  const [respondents, setRespondents] = useState<IPupillometryResult[]>([]);
  const [activeStudy, setActiveStudy] = useRecoilState(activeStudyState);
  const [activeGroup, setActiveGroup] = useRecoilState(activeGroupState);
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const { match } = props;
  const { groupName } = match.params;
  const group = activeStudy.groups.find((g) => g.name === groupName);
  const studyName = activeStudy.name ?? '';

  useEffect(() => {
    if (group) {
      setActiveGroup(group);
      setRespondents(group.respondents ?? []);
      setSelectedSegment(group.respondents[0]?.segments[0]?.name);
    }
  }, [setActiveGroup, group]);

  const handleOnDelete = (record: IRespondentRecord) => {
    const request: IStudyRequest = {
      method: 'deleteOne',
      query: {
        select: 'respondent',
        name: studyName,
        group: groupName,
        respondent: record.name,
      },
    };
    const responseChannel = IpcService.send('study', request);
    IpcService.on(responseChannel, () => {
      const respondentsCopy = [...respondents];
      removeElement(respondentsCopy, 'name', record.name);
      setActiveStudy((prevState) => {
        const groups = [...prevState.groups];
        const index = groups.findIndex((g) => g.name === groupName);
        groups[index] = { ...activeGroup, respondents: respondentsCopy };
        return { ...prevState, groups };
      });
      setRespondents(respondentsCopy);
    });
  };

  const onChange = (value: string) => {
    setSelectedSegment(value);
  };

  const dependant = group?.isDependant ? 'Dependant' : 'Independant';
  const segmentNames: string[] = getAllUniqueTasks(respondents);
  const options = segmentNames.map((name) => (
    <Select.Option key={name}>{name}</Select.Option>
  ));
  const validCount = respondents.reduce(
    (p, c) =>
      p +
      (c.segments
        .find((s) => s.name === selectedSegment)
        ?.classification.toLowerCase() === 'valid'
        ? 1
        : 0),
    0
  );
  const invalidCount = respondents.reduce(
    (p, c) =>
      p +
      (c.segments
        .find((s) => s.name === selectedSegment)
        ?.classification.toLowerCase() !== 'valid'
        ? 1
        : 0),
    0
  );
  // const means = segmentRecord.map((s) => s.mean);
  return (
    <ActiveStudy routerProps={props}>
      <ButtonGroup>
        <RouteLink
          to={Routes.AddRespondent(studyName, groupName)}
          Wrapper={() => <Button type="primary">Add Respondent</Button>}
        />
      </ButtonGroup>
      <Title level={2}>Overview</Title>
      <Text>Name: {group?.name ?? ''}</Text>
      <Text>Category: {dependant}</Text>
      <Title level={2}>All Respondents</Title>
      <Select
        style={{ minWidth: '100px', marginBottom: '30px' }}
        showSearch
        placeholder="Select segment"
        onChange={(v) => onChange(v)}
      >
        {options}
      </Select>
      <Space direction="vertical" size="large">
        <Space direction="vertical">
          <Text>Valid: {validCount}</Text>
          <Text>Invalid: {invalidCount}</Text>
        </Space>
        <RespondentTable
          segmentName={selectedSegment || segmentNames[0] || ''}
          handleOnDelete={handleOnDelete}
          respondents={respondents ?? []}
        />
      </Space>
    </ActiveStudy>
  );
}
