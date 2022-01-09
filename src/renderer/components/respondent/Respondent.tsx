import { RouteComponentProps } from 'react-router-dom';

interface MatchParams {
  respondentId: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

export default function Respondent(props: MatchProps) {
  // const { name } = props;
  const { match } = props;
  const { respondentId } = match.params;
  document.title += ` > ${respondentId}`;
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
        {/* <Chart /> */}
      </div>
    </div>
  );
}
