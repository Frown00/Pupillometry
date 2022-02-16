import { Button, Select } from 'antd';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { tTest } from 'simple-statistics';
import { useRecoilState } from 'recoil';
import { Routes } from '../../constants';
import { activeGroupState, activeStudyState } from '../../assets/state';
import ElectronWindow from '../../ElectronWindow';
import { removeElement } from '../../../util';
import { Channel } from '../../../ipc/channels';
import ActiveStudy from '../templates/ActiveStudy';
import RouteLink from '../atoms/RouteLink';
import Title from '../atoms/Title';
import Text from '../atoms/Text';
import RespondentTable, {
  IRespondentRecord,
} from '../organisms/table/RespondentTable';

interface MatchParams {
  studyName: string;
  groupName: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

interface IState {
  respondents: IRespondentSamples[];
}

const { ipcRenderer } = ElectronWindow.get().api;

export default function Group(props: MatchProps) {
  const [state, setState] = useState<IState>({
    respondents: [],
  });
  const [activeStudy, setActiveStudy] = useRecoilState(activeStudyState);
  const [activeGroup, setActiveGroup] = useRecoilState(activeGroupState);
  const { match } = props;
  const { groupName } = match.params;
  const group = activeStudy.groups.find((g) => g.name === groupName);
  const studyName = activeStudy.name ?? '';
  if (group) {
    setActiveGroup(group);
  }
  useEffect(() => {
    setState({ respondents: group?.respondents ?? [] });
  }, [group]);

  const handleOnDelete = (record: IRespondentRecord) => {
    const { respondents } = state;
    const respondentsCopy = [...respondents];
    const removed = removeElement(respondentsCopy, 'name', record.name);
    const deleteRespondent: IDeleteRespondent = {
      groupName,
      studyName,
      respondentName: removed.name,
    };
    ipcRenderer.send(Channel.DeleteRespondent, deleteRespondent);
    setActiveStudy((prevState) => {
      const groups = [...prevState.groups];
      const index = groups.findIndex((g) => g.name === groupName);
      groups[index] = { ...activeGroup, respondents: respondentsCopy };
      return { ...prevState, groups };
    });
    setState((prev) => ({ ...prev, respondents: respondentsCopy }));
  };

  const onChange = (value: any) => {
    const { respondents } = state;
    // setState((prev) => ({ ...prev, segmentRecord: respondents[value] }));
  };

  const onSearch = (val: any) => {};

  const dependant = group?.isDependant ? 'Dependant' : 'Independant';
  // console.log('GROUP CCC', GlobalState.configs);
  const options = [
    <Select.Option key="0">0</Select.Option>,
    <Select.Option key="1">1</Select.Option>,
    <Select.Option key="2">2</Select.Option>,
    <Select.Option key="3">3</Select.Option>,
    <Select.Option key="4">4</Select.Option>,
    <Select.Option key="5">5</Select.Option>,
    <Select.Option key="6">6</Select.Option>,
  ];
  // const validCount = segmentRecord.reduce(
  //   (p, c) => p + (c.validity.toLowerCase() === 'valid' ? 1 : 0),
  //   0
  // );
  // const invalidCount = segmentRecord.reduce(
  //   (p, c) => p + (c.validity.toLowerCase() === 'invalid' ? 1 : 0),
  //   0
  // );
  // const means = segmentRecord.map((s) => s.mean);
  return (
    <ActiveStudy routerProps={props}>
      <RouteLink
        to={Routes.AddRespondent(studyName, groupName)}
        Wrapper={() => <Button type="primary">Add Respondent</Button>}
      />
      <Title level={2}>Overview</Title>
      <Text>Category: {dependant}</Text>
      {/* <Text>Valid: {validCount}</Text>
      <Text>Invalid: {invalidCount}</Text>
      <Text>
        T-Test: {means.length > 0 ? tTest(means, 3.2).toFixed(2) : ''}
      </Text> */}
      <Title level={2}>All Respondents</Title>
      <Select
        style={{ minWidth: '100px', marginBottom: '30px' }}
        showSearch
        placeholder="Select segment"
        optionFilterProp="children"
        onChange={(v) => onChange(v)}
        onSearch={onSearch}
        filterOption={(input, option: any) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {options}
      </Select>
      <RespondentTable
        handleOnDelete={handleOnDelete}
        respondents={state?.respondents ?? []}
      />
    </ActiveStudy>
  );
}
