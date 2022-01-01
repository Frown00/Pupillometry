import { RouteComponentProps } from 'react-router-dom';
import Chart from '../../../charts/Chart';

interface MatchParams {
  participantId: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

export default function Participant(props: MatchProps) {
  // const { name } = props;
  const { match } = props;
  const { participantId } = match.params;
  document.title += ` > ${participantId}`;
  return (
    <div>
      <select>
        <option value="lime">P2</option>
        <option selected value={participantId}>
          {participantId}
        </option>
      </select>
      <h2>{participantId}</h2>
      <div>
        <h2>Overview</h2>
        <Chart />
      </div>
    </div>
  );
}
