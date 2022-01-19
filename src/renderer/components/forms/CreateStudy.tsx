/* eslint-disable react/jsx-props-no-spreading */
import { Form, Button } from 'antd';
import { IResponseCreateStudy } from '../../../ipc/types';
import TextItem from './items/TextItem';
import SelectItem from './items/SelectItem';
import ElectronWindow from '../../ElectronWindow';
import { Channel, State } from '../../../ipc/channels';
import GlobalState from '../GlobalState';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const { ipcRenderer } = ElectronWindow.get().api;

const CreateStudy = (props: any) => {
  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
    console.log('PROPS', props);
    const form: IRequestForm = {
      studyName: values.name,
      config: GlobalState.configs[values.config],
    };
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.CreateStudy,
      form,
    });
    ipcRenderer.on(Channel.CreateStudy, (message: IResponseCreateStudy) => {
      console.log('RENDERER', message);
      if (message.state === State.Loading) {
        //
      } else if (message.state === State.Done) {
        props.history.push(`/study/${values.name}`);
      } else throw new Error('Something went wrong');
    });
  };
  const { studies, configs } = GlobalState;

  console.log('Create Study CCCC', configs);
  return (
    <>
      <Form
        name="validate_other"
        {...formItemLayout}
        onFinish={onFinish}
        initialValues={{
          config: 'default',
        }}
      >
        <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
          <h1>Create Study</h1>
        </Form.Item>
        <TextItem
          name="name"
          label="Name"
          required
          reservedValues={studies.map((s) => s.name)}
        />
        <SelectItem
          name="config"
          label="Config"
          required
          values={Object.keys(GlobalState.configs)}
        />
        {/* {(console.log('VALUE'), value.studies)} */}
        <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default CreateStudy;
