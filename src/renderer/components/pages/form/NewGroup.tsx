import { useRecoilState } from 'recoil';
import { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import SwitchItem from '../../molecules/form/SwitchItem';
import FileSelectItem from '../../molecules/form/FileSelectItem';
import TextItem from '../../molecules/form/TextItem';
import SelectItem from '../../molecules/form/SelectItem';
import ActiveStudy from '../../templates/ActiveStudy';
import { Routes } from '../../../constants';
import { activeStudyState, configsState } from '../../../assets/state';
import Form from '../../organisms/Form';
import { Channel, State } from '../../../../ipc/channels';
import ElectronWindow from '../../../ElectronWindow';
import { IResponseCreateGroup } from '../../../../ipc/types';
import { ProgressLoader } from '../../atoms/Loader';

const { ipcRenderer } = ElectronWindow.get().api;

interface IInitialValues {
  config: string;
  isDependant: 'Dependant' | 'Independant';
}

interface MatchParams {
  studyName: string;
  groupName: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

const NewGroup = (props: MatchProps) => {
  const { history } = props;
  const [state, setState] = useState({ isLoading: false, progress: 0 });
  const [activeStudy, setActiveStudy] = useRecoilState(activeStudyState);
  const [configs] = useRecoilState(configsState);

  const onFinish = (values: any) => {
    values.study = activeStudy.name;
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
      config: configs[values.config],
    };
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.CreateGroup,
      form,
    });
    ipcRenderer.on(Channel.CreateGroup, (message: IResponseCreateGroup) => {
      if (message.state === State.Loading) {
        const progress = Math.round(message.progress * 100);
        setState({ isLoading: true, progress });
      } else if (message.state === State.Done) {
        const { groups } = activeStudy;
        const updated = [...groups];
        updated.push(message.response);
        setActiveStudy((prev) => ({
          ...prev,
          groups: updated,
        }));
        setState({ isLoading: false, progress: 100 });
        history.push(Routes.Group(values.study, values.name));
      } else throw new Error('Something went wrong');
    });
  };

  const loader = state.isLoading ? (
    <ProgressLoader progress={state.progress} />
  ) : undefined;

  const fields = [
    <TextItem
      key="name"
      name="name"
      label="Name"
      required
      reservedValues={activeStudy.groups.map((g) => g.name) ?? []}
    />,
    <SwitchItem
      key="isDependant"
      name="isDependant"
      label="Category"
      checkedLabel="Dependant"
      uncheckedLabel="Independant"
    />,
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
    isDependant: 'Dependant',
  };

  return (
    <ActiveStudy routerProps={props} Loader={loader}>
      <Form
        initialValues={initialValues}
        items={fields}
        onFinish={onFinish}
        title="Create Group"
      />
    </ActiveStudy>
  );
};

export default NewGroup;
