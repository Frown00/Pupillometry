import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { useRecoilState } from 'recoil';
import {
  activeGroupState,
  activeStudyState,
  configsState,
} from '../../assets/state';
import { Channel, State } from '../../../ipc/channels';
import ElectronWindow from '../../ElectronWindow';
import DefaultLoader from '../atoms/Loader';
import ActiveStudy from '../templates/ActiveStudy';
import { IResponseRespondentPupilData } from '../../../ipc/types';
import Title from '../atoms/Title';
import Text from '../atoms/Text';
import SelectWithSearch from '../molecules/SelectWithSearch';
import SegmentedLineGraph from '../organisms/SegmentedLineGraph';

interface MatchParams {
  studyName: string;
  groupName: string;
  respondentName: string;
}

interface IState {
  isLoading: boolean;
  respondent: IRespondentSamples | null;
}

type MatchProps = RouteComponentProps<MatchParams>;

const { ipcRenderer } = ElectronWindow.get().api;

export default function Respondent(props: MatchProps) {
  const { match, history } = props;
  const { respondentName } = match.params;
  const [state, setState] = useState<IState>({
    respondent: null,
    isLoading: true,
  });
  const [activeStudy] = useRecoilState(activeStudyState);
  const [activeGroup] = useRecoilState(activeGroupState);
  const [configs] = useRecoilState(configsState);

  useEffect(() => {
    const form: IRequestForm = {
      studyName: activeStudy.name,
      groupName: activeGroup.name,
      respondentName,
    };
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.GetRespondentPupilData,
      form,
    });
    ipcRenderer.on(
      Channel.GetRespondentPupilData,
      (message: IResponseRespondentPupilData) => {
        if (message.state === State.Loading) {
          setState((prev: IState) => ({ ...prev, isLoading: true }));
        } else {
          setState({
            isLoading: false,
            respondent: message.response,
          });
        }
      }
    );
    return () => {
      ipcRenderer.removeAllListeners(Channel.GetRespondentPupilData);
    };
  }, [activeStudy.name, activeGroup.name, respondentName]);

  const respondentNames = activeGroup.respondents.map((r) => r.name);
  const loader = state.isLoading ? <DefaultLoader /> : undefined;
  let config = null;
  if (state.respondent?.config) {
    config = configs[state.respondent?.config];
  }

  return (
    <ActiveStudy routerProps={props} Loader={loader}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title level={2}>{respondentName}</Title>
        <SelectWithSearch
          optionNames={respondentNames ?? []}
          placeholder="Select respondent"
          baseRoute={`/study/${activeStudy.name}/${activeGroup}`}
          width={100}
          history={history}
        />
      </div>
      <div>
        <Title level={2}>Overview</Title>
        <Text>Config: {config?.name ?? 'NO CONFIG'}</Text>
        {config ? (
          <SegmentedLineGraph
            config={config}
            respondentName={respondentName}
            segments={state.respondent?.segments ?? []}
          />
        ) : (
          <Title level={3}>
            <Text type="danger">Error with config</Text>
          </Title>
        )}
      </div>
    </ActiveStudy>
  );
}
