import { RouteComponentProps } from 'react-router-dom';
import GlobalState from '../GlobalState';
import * as configJSON from '../../../main/pupillary/config.json';
import SlidingTabs from './SlidingTabs';
import SelectWithSearch from './SelectWithSearch';

const DEFAULT_CONFIG = configJSON as IConfig;

interface MatchParams {
  name: string;
  groupName: string;
  respondentId: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

export default function Respondent(props: MatchProps) {
  // const { name } = props;
  const { match, history } = props;
  console.log('MATCH', match);
  const { name, groupName, respondentId } = match.params;
  document.title = `Pupillometry > ${name} > ${groupName} > ${respondentId}`;
  const respondentNames = GlobalState.currentGroup?.respondents.map(
    (r) => r.name
  );
  const respondent = GlobalState.currentGroup?.respondents.find(
    (r) => r.name === respondentId
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>{respondentId}</h2>
        <SelectWithSearch
          names={respondentNames ?? []}
          history={history}
          params={match.params}
        />
      </div>
      <div>
        <h2>Overview</h2>
        {/* {charts} */}
        <SlidingTabs
          respondentName={respondent?.name ?? ''}
          segments={respondent?.segments ?? []}
          config={DEFAULT_CONFIG}
        />
      </div>
    </div>
  );
}
