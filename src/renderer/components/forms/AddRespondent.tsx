/* eslint-disable react/jsx-props-no-spreading */
import { Form, Button } from 'antd';
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

const AddRespondent = (props: any) => {
  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
    console.log('PROPS', props);
    ipcRenderer.send(Channel.CreateStudy, values);
    props.history.push(`/study/${values.name}`);
  };
  const { studyAnnotations } = GlobalState;

  console.log('Add Respondent', props);
  return (
    <Form
      name="validate_other"
      {...formItemLayout}
      onFinish={onFinish}
      initialValues={{
        config: 'default-config',
      }}
    >
      <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
        <h1>Add Respondent</h1>
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

export default AddRespondent;
