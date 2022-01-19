/* eslint-disable react/jsx-props-no-spreading */
import { Form, Button, Switch, Progress } from 'antd';
import { useState } from 'react';
import { IResponseCreateGroup } from '../../../ipc/types';
import TextItem from './items/TextItem';
import SelectItem from './items/SelectItem';
import ElectronWindow from '../../ElectronWindow';
import { Channel, State } from '../../../ipc/channels';
import GlobalState from '../GlobalState';
import FileSelectItem from './items/FileSelectItem';
import DefaultLoader, { ProgressLoader } from '../Loader';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const { ipcRenderer } = ElectronWindow.get().api;

const CreateGroup = (props: any) => {
  const [getState, setState] = useState({ isLoading: false, progress: 0 });
  const onFinish = (values: any) => {
    console.log('PROPS', props);
    values.study = GlobalState.currentStudy?.name;
    const files = [];
    for (let i = 0; i < values.files.length; i += 1) {
      const { path, name } = values.files[i].originFileObj;
      files.push({ path, name });
    }
    const form: IRequestForm = {
      studyName: values.study,
      groupName: values.name,
      isDependant: values.isDependant,
      files,
      config: GlobalState.configs[values.config],
    };
    console.log('Received values of form: ', values);
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.CreateGroup,
      form,
    });
    ipcRenderer.on(Channel.CreateGroup, (message: IResponseCreateGroup) => {
      if (message.state === State.Loading) {
        const progress = Math.round(message.progress * 100);
        setState({ isLoading: true, progress });
      } else if (message.state === State.Done) {
        GlobalState.currentStudy?.groups.push(message.response);
        setState({ isLoading: false, progress: 100 });
        props.history.push(`/study/${values.study}/${values.name}`);
      } else throw new Error('Something went wrong');
    });
  };

  console.log('Create Group', props);
  const { isLoading, progress } = getState;
  const groups = GlobalState.currentStudy?.groups;
  const form = (
    <Form
      name="validate_other"
      {...formItemLayout}
      onFinish={onFinish}
      initialValues={{
        config: 'default',
        isDependant: 'Dependant',
      }}
    >
      <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
        <h1>Create Group</h1>
      </Form.Item>
      <TextItem
        name="name"
        label="Name"
        required
        reservedValues={groups?.map((g) => g.name) ?? []}
      />
      <Form.Item
        name="isDependant"
        label="Category"
        valuePropName="checked"
        rules={[{ required: true, message: 'Group must to have category!' }]}
      >
        <Switch checkedChildren="Dependent" unCheckedChildren="Independent" />
      </Form.Item>
      <SelectItem
        name="config"
        label="Config"
        required
        values={Object.keys(GlobalState.configs)}
      />
      <FileSelectItem />
      <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
  return <>{isLoading ? <ProgressLoader progress={progress} /> : form};</>;
};

export default CreateGroup;
