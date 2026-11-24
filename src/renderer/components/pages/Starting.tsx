import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Modal } from 'antd';
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
    IpcService.on(responseChannel, (_, response: IStudyResponse<IStudy[]>) => {
      if (response.state === State.Loading) {
        setLoading(true);
        return;
      }
      setLoading(false);
      if (response.state === State.Done && response.result) {
        setStudies(response.result);
      }
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
    IpcService.on(
      responseChannel,
      (_, response: IConfigResponse<IConfigMap>) => {
        if (response.state === State.Loading) {
          setLoading(true);
          return;
        }
        setLoading(false);
        if (response.state === State.Done && response.result) {
          setConfigs(response.result);
        }
      }
    );
    return () => {
      IpcService.removeAllListeners(responseChannel);
    };
  }, [setLoading, setConfigs]);

  const handleOnDelete = (record: IStudyRecord) => {
    Modal.confirm({
      title: 'Delete study?',
      content: `This will permanently remove "${record.name}" and all of its data.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        const studiesCopy = [...studies];
        const request: IStudyRequest = {
          method: 'deleteOne',
          query: {
            name: record.name,
            select: 'study',
          },
        };
        const responseChannel = IpcService.send('study', request);
        IpcService.on(responseChannel, (_, response: IStudyResponse) => {
          if (response.state === State.Error) return;
          removeElement(studiesCopy, 'name', record.name);
          setStudies(studiesCopy);
          IpcService.removeAllListeners(responseChannel);
        });
      },
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
            Modal.confirm({
              title: 'Remove all studies?',
              content:
                'This permanently removes every study and processed file.',
              okText: 'Remove all',
              okType: 'danger',
              onOk: () => {
                const request: IStudyRequest = {
                  method: 'clear',
                  query: {},
                };
                IpcService.send('study', request);
                window.location.reload();
              },
            });
          }}
        >
          Remove All
        </Button>
      </ButtonGroup>
      <div>
        <Title level={2}>All studies</Title>
        <StudyTable studies={studies} handleOnDelete={handleOnDelete} />
      </div>
    </General>
  );
}
