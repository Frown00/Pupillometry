import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { removeElement } from '../../../util';
import { Routes } from '../../constants';
import ElectronWindow from '../../ElectronWindow';
import General from '../templates/General';
import { Channel, State } from '../../../ipc/channels';
import { IResponseGetConfigs, IResponseGetStudies } from '../../../ipc/types';
import RouteLink from '../atoms/RouteLink';
import Button from '../atoms/Button';
import Title from '../atoms/Title';
import BlockLink from '../molecules/BlockLink';
import ButtonGroup from '../molecules/ButtonGroup';
import StudyTable, { IStudyRecord } from '../organisms/table/StudyTable';
import { configsState, studiesState } from '../../assets/state';
import DefaultLoader from '../atoms/Loader';

interface IState {
  isLoading: boolean;
  studies: IStudy[];
  recent: IStudy | null;
}
const { ipcRenderer } = ElectronWindow.get().api;

export default function StartingPage() {
  const [state, setState] = useState<IState>({
    isLoading: true,
    studies: [],
    recent: null,
  });
  const [, setStudies] = useRecoilState(studiesState);
  const [, setConfigs] = useRecoilState(configsState);

  useEffect(() => {
    // LOAD STUDIES
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.GetStudies,
    });
    ipcRenderer.on(Channel.GetStudies, (message: IResponseGetStudies) => {
      if (message.state === State.Loading) {
        setState((prev: IState) => ({ ...prev, isLoading: true }));
      } else if (message.state === State.Done) {
        setState((prev: IState) => ({
          ...prev,
          isLoading: false,
          studies: message.response,
        }));
        setStudies(message.response);
      }
    });
    // LOAD CONFIGS
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.GetConfigs,
    });
    ipcRenderer.on(Channel.GetConfigs, (message: IResponseGetConfigs) => {
      if (message.state === State.Loading) {
        setState((prev) => ({ ...prev, isLoading: true }));
      } else if (message.state === State.Done) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
        setConfigs(message.response);
      }
    });
    return () => {
      ipcRenderer.removeAllListeners(Channel.GetStudies);
      ipcRenderer.removeAllListeners(Channel.GetConfigs);
    };
  }, [setStudies, setConfigs]);

  const handleOnDelete = (record: IStudyRecord) => {
    const { studies } = state;
    const studiesCopy = [...studies];
    const removed = removeElement(studiesCopy, 'name', record.name);
    const deleteForm: IDeleteStudy = { studyName: removed.name };
    ipcRenderer.send(Channel.DeleteStudy, deleteForm);
    setState((prev) => ({ ...prev, studies: studiesCopy }));
    setStudies(studiesCopy);
  };

  const { isLoading, studies, recent } = state;
  const loader = isLoading ? <DefaultLoader /> : undefined;

  return (
    <General Loader={loader}>
      <ButtonGroup>
        <RouteLink
          to={Routes.NewStudy}
          Wrapper={() => <Button type="primary">New Study</Button>}
        />
        <Button
          onClick={() => {
            ipcRenderer.send(Channel.ClearDB);
            window.location.reload();
          }}
        >
          Remove All
        </Button>
      </ButtonGroup>
      <div>
        <Title level={2}>Recent</Title>
        <BlockLink to="/study/Study 1" label="Study 1" />
      </div>
      <div>
        <Title level={2}>All studies</Title>
        <StudyTable studies={studies} handleOnDelete={handleOnDelete} />
      </div>
    </General>
  );
}
