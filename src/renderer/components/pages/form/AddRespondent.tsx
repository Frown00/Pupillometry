import { useRecoilState } from 'recoil';
import { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { State } from '../../../../ipc/interfaces';
import FileSelectItem from '../../molecules/form/FileSelectItem';
import SelectItem from '../../molecules/form/SelectItem';
import ActiveStudy from '../../templates/ActiveStudy';
import {
  activeGroupState,
  activeStudyState,
  configsState,
} from '../../../assets/state';
import Form from '../../organisms/Form';
import { ProgressLoader } from '../../atoms/Loader';
import {
  IStudyRequest,
  IStudyResponse,
} from '../../../../ipc/channels/StudyChannel';
import IpcService from '../../../IpcService';

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
  const [isLoading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStudy, setActiveStudy] = useRecoilState(activeStudyState);
  const [activeGroup] = useRecoilState(activeGroupState);
  const [configs] = useRecoilState(configsState);

  const onFinish = (values: { files: any[]; config: string }) => {
    const files = [];
    for (let i = 0; i < values.files.length; i += 1) {
      const { path, name } = values.files[i].originFileObj;
      files.push({ path, name });
    }
    const request: IStudyRequest = {
      method: 'create',
      query: {
        name: activeStudy.name,
        group: activeGroup.name,
        select: 'respondent',
        form: {
          files,
          config: configs[values.config],
        },
      },
    };
    const responseChannel = IpcService.send('study', request);

    IpcService.on(responseChannel, (_, response: IStudyResponse) => {
      if (response.state === State.Loading) {
        const progressPercent = Math.round(response.progress * 100);
        setLoading(true);
        setProgress(progressPercent);
        return;
      }
      if (response.state === State.Done) {
        setActiveStudy((prevState) => {
          const groups = [...prevState.groups];
          const index = groups.findIndex(
            (g) => g.name === response.result.name
          );
          groups[index] = response.result;
          return { ...prevState, groups };
        });
        setLoading(false);
        setProgress(100);
        IpcService.removeAllListeners(responseChannel);
        history.push(`/study/${activeStudy.name}/${activeGroup.name}`);
      } else throw new Error('Something went wrong');
    });
  };

  const loader = isLoading ? <ProgressLoader progress={progress} /> : undefined;

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
