import { RouteComponentProps } from 'react-router-dom';
import { Divider, List, Select, Space } from 'antd';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import { IPupillometryRequest } from '../../../../ipc/channels/PupillometryChannel';
import { ChannelNames } from '../../../../ipc/interfaces';
import IpcService from '../../../IpcService';
import { removeElement } from '../../../../util';
import Button from '../../atoms/Button';
import ActiveStudy from '../../templates/ActiveStudy';
import CreateTaskGroup from '../../organisms/CreateTaskGroup';
import { activeStudyState, taskGroupsState } from '../../../assets/state';
import Title from '../../atoms/Title';

const { Option } = Select;
interface MatchParams {
  studyName: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

const TaskGroupList = () => {
  const [taskGroups, setTaskGroupsState] = useRecoilState(taskGroupsState);
  const groupCards: JSX.Element[] = [];

  const onDelete = (groupName: string, taskGroupName: string) => {
    const tasks = [...taskGroups[groupName]];
    removeElement(tasks, 'name', taskGroupName);
    const updated = {
      [groupName]: tasks,
    };
    if (tasks.length > 0) setTaskGroupsState({ ...taskGroups, ...updated });
    else {
      const taskClone = { ...taskGroups };
      delete taskClone[groupName];
      setTaskGroupsState(taskClone);
    }
  };

  Object.entries(taskGroups).map(([name, groupedTasks]) =>
    groupCards.push(
      <li key={name}>
        <List
          grid={{ gutter: 16, column: 4 }}
          header={<Title level={4}>{name}</Title>}
          dataSource={groupedTasks}
          renderItem={(item) => (
            <List.Item>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ alignSelf: 'flex-end' }}>
                  <Button
                    type="text"
                    onClick={() => onDelete(name, item.name)}
                    danger
                  >
                    X
                  </Button>
                </div>
                <List
                  size="small"
                  header={<Title level={5}>{item.name}</Title>}
                  bordered
                  dataSource={item.tasks}
                  renderItem={(taskName) => <List.Item>{taskName}</List.Item>}
                />
              </div>
            </List.Item>
          )}
        />
        <Divider />
      </li>
    )
  );
  return (
    <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 2,
        md: 4,
        lg: 4,
        xl: 6,
        xxl: 3,
      }}
    >
      {groupCards}
    </List>
  );
};

export default function Export(props: MatchProps) {
  const [taskGroups, setTaskGroupsState] = useRecoilState(taskGroupsState);
  const [activeStudy] = useRecoilState(activeStudyState);
  const [selectedGroupId, setSelectedGroupId] = useState<number>(0);

  const onClick = () => {
    const request: IPupillometryRequest = {
      method: 'export',
      query: {
        export: {
          study: activeStudy,
          taskGroups,
        },
      },
    };
    IpcService.send(ChannelNames.PUPILLOMETRY, request);
    setTaskGroupsState({});
  };

  const onChange = (value: string) => {
    const idx = activeStudy.groups.findIndex((g) => g.name === value);
    setSelectedGroupId(idx);
  };

  const taskNames = new Set<string>();
  const groupNames = new Set<string>();
  activeStudy.groups.map((g) => groupNames.add(g.name));
  const group = activeStudy.groups[selectedGroupId];
  for (let i = 0; i < group?.respondents?.length; i += 1) {
    const r = group.respondents[i];
    r.segments.map((s) => taskNames.add(s.name));
  }
  return (
    <ActiveStudy routerProps={props}>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Title level={2}>Export to Excel File</Title>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <span>Study group</span>
            <Select
              id="select-group"
              defaultValue={group.name ?? ''}
              onChange={onChange}
            >
              {Array.from(groupNames).map((name) => (
                <Option key={name} value={name}>
                  {name}
                </Option>
              ))}
            </Select>
          </Space>
          <Title level={5}>Grouping Tasks</Title>
          <CreateTaskGroup
            key="task"
            groupName={group.name}
            values={Array.from(taskNames)}
          />
          <Button onClick={onClick} type="primary" block>
            Export
          </Button>
        </Space>
        <TaskGroupList />
      </Space>
    </ActiveStudy>
  );
}
