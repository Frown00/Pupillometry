import { useRecoilState } from 'recoil';
import { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import IpcService from '../../../IpcService';
import {
  IStudyRequest,
  IStudyResponse,
} from '../../../../ipc/channels/StudyChannel';
import SwitchItem from '../../molecules/form/SwitchItem';
import FileSelectItem from '../../molecules/form/FileSelectItem';
import TextItem from '../../molecules/form/TextItem';
import SelectItem from '../../molecules/form/SelectItem';
import ActiveStudy from '../../templates/ActiveStudy';
import { activeStudyState, configsState } from '../../../assets/state';
import Form from '../../organisms/Form';
import { ProgressLoader } from '../../atoms/Loader';
import { Routes } from '../../../routes';
import { State } from '../../../../ipc/interfaces';

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
  const [isLoading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStudy, setActiveStudy] = useRecoilState(activeStudyState);
  const [configs] = useRecoilState(configsState);

  const onFinish = (values: {
    name: string;
    isDependant: string;
    files: any[];
    config: string;
  }) => {
    const files = [];
    for (let i = 0; i < values.files.length; i += 1) {
      const { path, name } = values.files[i].originFileObj;
      files.push({ path, name });
    }
    const request: IStudyRequest = {
      method: 'create',
      query: {
        name: activeStudy.name,
        select: 'group',
        form: {
          groupName: values.name,
          isDependant: values.isDependant === 'Dependant',
          files,
          config: configs[values.config],
        },
      },
    };
    const responseChannel = IpcService.send('study', request);
    IpcService.on(responseChannel, (_, response: IStudyResponse) => {
      if (response.state === State.Loading) {
        console.log('RESPONSE LOADING', response);
        const progressPercent = Math.round(response.progress * 100);
        setLoading(true);
        setProgress(progressPercent);
        return;
      }
      if (response.state === State.Done) {
        const { groups } = activeStudy;
        const updated = [...groups];
        updated.push(response.result);
        console.log(response.result);
        console.log(updated);
        setActiveStudy((prev) => ({
          ...prev,
          groups: updated,
        }));
        setLoading(false);
        setProgress(100);
        IpcService.removeAllListeners(responseChannel);
        history.push(Routes.Group(activeStudy.name, values.name));
        return;
      }
      throw new Error('Something went wrong');
    });
  };

  const loader = isLoading ? <ProgressLoader progress={progress} /> : undefined;

  const fields = [
    <TextItem
      key="name"
      name="name"
      label="Name"
      required
      reservedValues={activeStudy?.groups.map((g) => g?.name) ?? []}
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
    config: 'Recommended',
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
