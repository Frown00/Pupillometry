import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  IConfigRequest,
  IConfigResponse,
} from '../../../ipc/channels/ConfigChannel';
import IpcService from '../../IpcService';
import {
  IStudyRequest,
  IStudyResponse,
} from '../../../ipc/channels/StudyChannel';
import { removeElement } from '../../../util';
import { Routes } from '../../routes';
import General from '../templates/General';
import RouteLink from '../atoms/RouteLink';
import Button from '../atoms/Button';
import Title from '../atoms/Title';
import BlockLink from '../molecules/BlockLink';
import ButtonGroup from '../molecules/ButtonGroup';
import StudyTable, { IStudyRecord } from '../organisms/table/StudyTable';
import { configsState, studiesState } from '../../assets/state';
import DefaultLoader from '../atoms/Loader';
import { State } from '../../../ipc/interfaces';

export default function StartingPage() {
  const [isLoading, setLoading] = useState(false);
  const [studies, setStudies] = useRecoilState(studiesState);
  const [, setConfigs] = useRecoilState(configsState);
  // LOAD STUDIES
  useEffect(() => {
    const request: IStudyRequest = {
      method: 'readAll',
      query: {
        select: 'study',
      },
    };
    const responseChannel = IpcService.send('study', request);
    IpcService.on(responseChannel, (_, response: IStudyResponse) => {
      if (response.state === State.Loading) {
        setLoading(true);
        return;
      }
      setLoading(false);
      setStudies(response.result);
    });
    return () => {
      IpcService.removeAllListeners('study');
    };
  }, [setLoading, setStudies]);

  // LOAD CONFIGS
  useEffect(() => {
    const request: IConfigRequest = {
      method: 'readAll',
      query: {},
    };
    const responseChannel = IpcService.send('config', request);
    IpcService.on(responseChannel, (_, response: IConfigResponse) => {
      if (response.state === State.Loading) {
        setLoading(true);
        return;
      }
      setLoading(false);
      console.log('CONFIG', response);
      setConfigs(response.result);
    });
    return () => {
      IpcService.removeAllListeners(responseChannel);
    };
  }, [setLoading, setConfigs]);

  const handleOnDelete = (record: IStudyRecord) => {
    const studiesCopy = [...studies];
    const request: IStudyRequest = {
      method: 'deleteOne',
      query: {
        name: record.name,
      },
    };
    const responseChannel = IpcService.send('study', request);
    IpcService.on(responseChannel, () => {
      removeElement(studiesCopy, 'name', record.name);
      setStudies(studiesCopy);
    });
  };

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
            const request: IStudyRequest = {
              method: 'clear',
              query: {},
            };
            IpcService.send('study', request);
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
