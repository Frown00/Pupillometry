import { PlusCircleFilled } from '@ant-design/icons';
import { Button, Form, Select } from 'antd';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { taskGroupsState } from '../../assets/state';
import TextItem from '../molecules/form/TextItem';

const { Option } = Select;

interface IProps {
  groupName: string;
  values: string[];
}

export default function CreateTaskGroup(props: IProps) {
  const [form] = Form.useForm();
  const [taskGroups, setTaskGroupsState] = useRecoilState(taskGroupsState);
  const { groupName, values } = props;
  useEffect(() => {
    form.resetFields();
  }, [form, groupName]);
  const onFinish = () => {
    const taskGroup: ITaskGroup = {
      name: form.getFieldValue('name'),
      tasks: form.getFieldValue('tasks'),
    };
    if (taskGroup.tasks.length > 0) {
      const tasks = taskGroups[groupName] ?? [];
      setTaskGroupsState({ ...taskGroups, [groupName]: [...tasks, taskGroup] });
    }
    form.resetFields();
  };

  const options = values.map((v) => <Option key={v}>{v}</Option>);
  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      initialValues={{ tasks: [] }}
    >
      <TextItem
        key="name"
        name="name"
        label="Name"
        required
        reservedValues={[]}
      />
      <Form.Item
        name="tasks"
        rules={[{ required: true, message: 'This field is required' }]}
      >
        <Select
          mode="multiple"
          allowClear
          style={{ width: '100%' }}
          placeholder="Select tasks to group them"
        >
          {options}
        </Select>
      </Form.Item>
      <Button type="ghost" htmlType="submit" block>
        <PlusCircleFilled />
        Add Group
      </Button>
    </Form>
  );
}
