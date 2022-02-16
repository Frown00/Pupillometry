import { useRecoilState } from 'recoil';
import SelectItem from '../../molecules/form/SelectItem';
import TextItem from '../../molecules/form/TextItem';
import { configsState, studiesState } from '../../../assets/state';
import General from '../../templates/General';
import Form from '../../organisms/Form';
import { Channel, State } from '../../../../ipc/channels';
import ElectronWindow from '../../../ElectronWindow';
import { IResponseCreateStudy } from '../../../../ipc/types';

const { ipcRenderer } = ElectronWindow.get().api;

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
    const form: IRequestForm = {
      studyName: values.name,
      config: configs[values.config],
    };
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.CreateStudy,
      form,
    });
    ipcRenderer.on(Channel.CreateStudy, (message: IResponseCreateStudy) => {
      if (message.state === State.Loading) {
        // no loader
      } else if (message.state === State.Done) {
        history.push(`/study/${values.name}`);
      } else throw new Error('Something went wrong');
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
    <SelectItem
      key="config"
      name="config"
      label="Config"
      required
      values={Object.keys(configs)}
    />,
  ];
  const initialValues: IInitialValues = {
    config: 'default',
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
