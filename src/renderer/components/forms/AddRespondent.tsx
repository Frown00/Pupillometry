/* eslint-disable react/jsx-props-no-spreading */
import { Form, Button } from 'antd';
import { useState } from 'react';
import SelectItem from './items/SelectItem';
import ElectronWindow from '../../ElectronWindow';
import { Channel, State } from '../../../ipc/channels';
import GlobalState from '../GlobalState';
import FileSelectItem from './items/FileSelectItem';
import { IResponseAddRespondent } from '../../../ipc/types';
import DefaultLoader from '../Loader';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const { ipcRenderer } = ElectronWindow.get().api;

const AddRespondent = (props: any) => {
  const [getState, setState] = useState({ isLoading: false, progress: 0 });

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
    console.log('PROPS', props);
    values.study = GlobalState.currentStudy?.name;
    values.groupName = GlobalState.currentGroup?.name;
    const files = [];
    for (let i = 0; i < values.files.length; i += 1) {
      const { path, name } = values.files[i].originFileObj;
      files.push({ path, name });
    }
    values.files = files;
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.AddRespondent,
      form: values,
    });
    ipcRenderer.on(Channel.AddRespondent, (message: IResponseAddRespondent) => {
      if (message.state === State.Loading) {
        const progress = Math.round(message.progress * 100);
        if (message.response) {
          const group = GlobalState.currentStudy?.groups.find(
            (g) => g.name === values.groupName
          );
          group?.respondents.push(message.response);
        }
        setState({ isLoading: true, progress });
      } else if (message.state === State.Done) {
        setState({ isLoading: false, progress: 100 });
        const { name, groupName } = props.match.params;
        console.log('DONE', name, groupName);
        props.history.push(`/study/${name}/${groupName}`);
      } else throw new Error('Something went wrong');
    });
  };
  const { isLoading, progress } = getState;
  const form = (
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
  return <>{isLoading ? <DefaultLoader progress={progress} /> : form};</>;
};

export default AddRespondent;
