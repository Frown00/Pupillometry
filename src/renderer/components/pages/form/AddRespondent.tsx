import { useRecoilState } from 'recoil';
import { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import FileSelectItem from '../../molecules/form/FileSelectItem';
import SelectItem from '../../molecules/form/SelectItem';
import ActiveStudy from '../../templates/ActiveStudy';
import {
  activeGroupState,
  activeStudyState,
  configsState,
} from '../../../assets/state';
import Form from '../../organisms/Form';
import { Channel, State } from '../../../../ipc/channels';
import ElectronWindow from '../../../ElectronWindow';
import { IResponseAddRespondent } from '../../../../ipc/types';
import { ProgressLoader } from '../../atoms/Loader';

const { ipcRenderer } = ElectronWindow.get().api;

interface IInitialValues {
  config: string;
}

interface MatchParams {
  studyName: string;
  groupName: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

const AddRespondent = (props: MatchProps) => {
  const { history } = props;
  const [state, setState] = useState({ isLoading: false, progress: 0 });
  const [activeStudy, setActiveStudy] = useRecoilState(activeStudyState);
  const [activeGroup] = useRecoilState(activeGroupState);
  const [configs] = useRecoilState(configsState);

  const onFinish = (values: any) => {
    values.study = activeStudy.name;
    values.groupName = activeGroup.name;
    const files = [];
    for (let i = 0; i < values.files.length; i += 1) {
      const { path, name } = values.files[i].originFileObj;
      files.push({ path, name });
    }
    const form: IRequestForm = {
      studyName: values.study,
      groupName: values.groupName,
      files,
      config: configs[values.config],
    };
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.AddRespondent,
      form,
    });
    ipcRenderer.on(Channel.AddRespondent, (message: IResponseAddRespondent) => {
      if (message.state === State.Loading) {
        const progress = Math.round(message.progress * 100);
        setState({ isLoading: true, progress });
      } else if (message.state === State.Done) {
        setActiveStudy((prevState) => {
          const groups = [...prevState.groups];
          const index = groups.findIndex(
            (g) => g.name === message.response.name
          );
          groups[index] = message.response;
          return { ...prevState, groups };
        });
        setState({ isLoading: false, progress: 100 });
        ipcRenderer.removeAllListeners(Channel.AddRespondent);
        history.push(`/study/${activeStudy.name}/${activeGroup.name}`);
      } else throw new Error('Something went wrong');
    });
  };

  const loader = state.isLoading ? (
    <ProgressLoader progress={state.progress} />
  ) : undefined;

  const fields = [
    <SelectItem
      key="config"
      name="config"
      label="Config"
      required
      values={Object.keys(configs)}
    />,
    <FileSelectItem key="file-select" />,
  ];
  const initialValues: IInitialValues = {
    config: 'default',
  };

  return (
    <ActiveStudy routerProps={props} Loader={loader}>
      <Form
        initialValues={initialValues}
        items={fields}
        onFinish={onFinish}
        title="Add Respondents"
      />
    </ActiveStudy>
  );
};

export default AddRespondent;
