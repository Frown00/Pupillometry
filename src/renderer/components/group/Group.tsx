import { Button } from 'antd';
import { Link, RouteComponentProps } from 'react-router-dom';
import GlobalState from '../GlobalState';

interface MatchParams {
  groupName: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

export default function Group(props: MatchProps) {
  // const { name } = props;
  const { match } = props;
  const { groupName } = match.params;
  document.title += ` > ${groupName}`;
  const group = GlobalState.currentStudy?.groups?.find(
    (g) => g.name === groupName
  );
  GlobalState.currentGroup = group;
  console.log('GROUPS', group);
  const dependent = group?.isDependent ? 'Dependent' : 'Independent';
  const respondents = group?.respondents?.map((r: any) => (
    <Link
      to={`/study/${GlobalState.currentStudy?.name}/${group.name}/${r.name}`}
    >
      <li key={r.name} className="link-page">
        {r.name}
      </li>
    </Link>
  ));
  return (
    <div>
      <h2>{groupName}</h2>
      <div>
        <h2>Overview</h2>
        <p>{dependent}</p>
        <Link to="/form/addRespondent">
          <Button type="primary">Add Respondent</Button>
        </Link>
        <h2>All respondents</h2>
        <ul>{respondents}</ul>
      </div>
    </div>
  );
}
