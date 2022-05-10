import { useRecoilState } from 'recoil';
import { IStudyRequest } from '../../../../ipc/channels/StudyChannel';
import IpcService from '../../../IpcService';
import SelectItem from '../../molecules/form/SelectItem';
import TextItem from '../../molecules/form/TextItem';
import { configsState, studiesState } from '../../../assets/state';
import General from '../../templates/General';
import Form from '../../organisms/Form';
import { State } from '../../../../ipc/interfaces';

interface IInitialValues {
  config: string;
}

interface IProps {
  history: any;
}

const NewStudy = (props: IProps) => {
  const { history } = props;
  const [configs] = useRecoilState(configsState);
  const [studies] = useRecoilState(studiesState);

  const onFinish = (values: any) => {
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
      if (response.state === State.Done) {
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
      />
    </General>
  );
};

export default NewStudy;
