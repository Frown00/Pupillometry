import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { useRecoilState } from 'recoil';
import { Space } from 'antd';
import {
  IStudyRequest,
  IStudyResponse,
} from '../../../ipc/channels/StudyChannel';
import {
  activeGroupState,
  activeStudyState,
  configsState,
} from '../../assets/state';
import DefaultLoader from '../atoms/Loader';
import ActiveStudy from '../templates/ActiveStudy';
import Title from '../atoms/Title';
import Text from '../atoms/Text';
import SelectWithSearch from '../molecules/SelectWithSearch';
import SegmentedLineGraph from '../organisms/SegmentedLineGraph';
import { State } from '../../../ipc/interfaces';
import IpcService from '../../IpcService';

interface MatchParams {
  studyName: string;
  groupName: string;
  respondentName: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

export default function Respondent(props: MatchProps) {
  const { match, history } = props;
  const { respondentName } = match.params;
  const [isLoading, setLoading] = useState(false);
  const [respondent, setRespondent] = useState<IPupillometryResult | null>(
    null
  );
  const [activeStudy] = useRecoilState(activeStudyState);
  const [activeGroup] = useRecoilState(activeGroupState);
  const [configs] = useRecoilState(configsState);

  useEffect(() => {
    const request: IStudyRequest = {
      method: 'readOne',
      query: {
        name: activeStudy.name,
        group: activeGroup.name,
        respondent: respondentName,
        select: 'respondent',
      },
    };
    const responseChannel = IpcService.send('study', request);
    IpcService.on(responseChannel, (e, response: IStudyResponse) => {
      if (response.state === State.Loading) {
        setLoading(true);
        return;
      }
      if (response.state === State.Done) {
        setRespondent(response.result);
        setLoading(false);
      }
    });
    return () => {
      IpcService.removeAllListeners(responseChannel);
    };
  }, [activeStudy.name, activeGroup.name, respondentName]);

  const respondentNames = activeGroup.respondents.map((r) => r.name);
  const loader = isLoading ? <DefaultLoader /> : undefined;
  let config = null;
  if (respondent?.config) {
    config = configs[respondent?.config];
  }

  const chart = config ? (
    <SegmentedLineGraph
      config={config}
      respondentName={respondentName}
      segments={respondent?.segments ?? []}
    />
  ) : (
    <Title level={3}>
      <Text type="danger">Error with config</Text>
    </Title>
  );
  return (
    <ActiveStudy routerProps={props} Loader={loader}>
      <Space>
        <Title level={2}>{respondentName}</Title>
      </Space>
      <Space direction="vertical">
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Title level={2}>Overview</Title>
          <SelectWithSearch
            optionNames={respondentNames ?? []}
            placeholder="Select respondent"
            baseRoute={`/study/${activeStudy.name}/${activeGroup.name}`}
            width={200}
            history={history}
          />
        </Space>
        <Text>Config: {config?.name ?? 'NO CONFIG'}</Text>
        {chart}
      </Space>
    </ActiveStudy>
  );
}
