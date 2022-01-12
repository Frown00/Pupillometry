/* eslint-disable react/jsx-props-no-spreading */
import { Form, Button, Switch } from 'antd';
import { config } from 'process';
import TextItem from './items/TextItem';
import SelectItem from './items/SelectItem';
import ElectronWindow from '../../ElectronWindow';
import { Channel } from '../../../ipc/channels';
import GlobalState from '../GlobalState';
import FileSelectItem from './items/FileSelectItem';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const { ipcRenderer } = ElectronWindow.get().api;

const CreateGroup = (props: any) => {
  const onFinish = (values: any) => {
    console.log('PROPS', props);
    values.study = GlobalState.currentStudy?.name;
    const files = [];
    for (let i = 0; i < values.files.length; i += 1) {
      const { path, name } = values.files[i].originFileObj;
      files.push({ path, name });
    }
    values.files = files;
    console.log('Received values of form: ', values);
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.CreateGroup,
      form: values,
    });
    ipcRenderer.on(Channel.CreateGroup, (response: any) => {
      console.log(response);
      if (response === 'OK') {
        console.log('PUSH');
        props.history.push(`/study/${values.study}/${values.name}`);
      }
    });
  };
  const { studies } = GlobalState;

  console.log('Create Group', props);
  return (
    <Form
      name="validate_other"
      {...formItemLayout}
      onFinish={onFinish}
      initialValues={{
        config: 'default-config',
        isDependent: 'Dependent',
      }}
    >
      <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
        <h1>Create Group</h1>
      </Form.Item>
      <TextItem name="name" label="Name" required reservedValues={[]} />
      <Form.Item
        name="isDependent"
        label="Category"
        valuePropName="checked"
        rules={[{ required: true, message: 'Group must to have category!' }]}
      >
        <Switch checkedChildren="Dependent" unCheckedChildren="Independent" />
      </Form.Item>
      <SelectItem name="config" label="Config" required />
      <FileSelectItem />
      <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateGroup;
