import { RouteComponentProps } from 'react-router-dom';
import Chart from '../charts/Chart';
import GlobalState from '../GlobalState';
import * as configJSON from '../../../main/pupillary/config.json';

const DEFAULT_CONFIG = configJSON as IConfig;

interface MatchParams {
  respondentId: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

export default function Respondent(props: MatchProps) {
  // const { name } = props;
  const { match } = props;
  const { respondentId } = match.params;
  document.title += ` > ${respondentId}`;

  const respondent = GlobalState.currentGroup?.respondents.find(
    (r) => r.name === respondentId
  );
  console.log('GROUP', GlobalState.currentGroup);
  console.log('RESPONDENT', respondent);
  const charts = respondent?.segments?.map((segment) => (
    <li key={segment.name}>
      <Chart config={DEFAULT_CONFIG} samples={segment} name={respondent.name} />
    </li>
  ));
  return (
    <div>
      <select>
        <option value="lime">P2</option>
        <option selected value={respondentId}>
          {respondentId}
        </option>
      </select>
      <h2>{respondentId}</h2>
      <div>
        <h2>Overview</h2>
        {charts}
      </div>
    </div>
  );
}
