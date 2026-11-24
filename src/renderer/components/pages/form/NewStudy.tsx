import { useRecoilState } from 'recoil';
import { useState } from 'react';
import { message } from 'antd';
import type { RouteComponentProps } from 'react-router';
import { IStudyRequest } from '../../../../ipc/channels/StudyChannel';
import IpcService from '../../../IpcService';
import TextItem from '../../molecules/form/TextItem';
import { configsState, studiesState } from '../../../assets/state';
import General from '../../templates/General';
import Form from '../../organisms/Form';
import { State } from '../../../../ipc/interfaces';

interface IStudyFormValues {
  name: string;
  config: string;
}

type IProps = RouteComponentProps;

interface IInitialValues {
  config: string;
}

const NewStudy = (props: IProps) => {
  const { history } = props;
  const [configs] = useRecoilState(configsState);
  const [studies] = useRecoilState(studiesState);
  const [isLoading, setLoading] = useState(false);

  const onFinish = (values: IStudyFormValues) => {
    setLoading(true);
    const request: IStudyRequest = {
      method: 'create',
      query: {
        select: 'study',
        form: {
          studyName: values.name,
          config: configs[values.config],
        },
      },
    };
    const responseChannel = IpcService.send('study', request);
    IpcService.on(responseChannel, (_, response) => {
      if (response.state === State.Loading) {
        // setLoading(true);
        return;
      }
      if (response.state === State.Error) {
        setLoading(false);
        message.error(response.error || 'Cannot create the study');
        IpcService.removeAllListeners(responseChannel);
        return;
      }
      if (response.state === State.Done) {
        setLoading(false);
        IpcService.removeAllListeners(responseChannel);
        history.push(`/study/${values.name}`);
        return;
      }
      throw new Error('Something went wrong');
    });
  };

  const fields = [
    <TextItem
      key="name"
      name="name"
      label="Name"
      required
      reservedValues={studies.map((s) => s.name)}
    />,
  ];
  const initialValues: IInitialValues = {
    config: 'Recommended',
  };
  return (
    <General>
      <Form
        initialValues={initialValues}
        items={fields}
        onFinish={onFinish}
        title="Create Study"
        isLoading={isLoading}
      />
    </General>
  );
};

export default NewStudy;
