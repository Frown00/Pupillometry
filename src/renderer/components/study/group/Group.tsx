import { Link, RouteComponentProps } from 'react-router-dom';

interface MatchParams {
  groupName: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

export default function Group(props: MatchProps) {
  // const { name } = props;
  const { match } = props;
  const { groupName } = match.params;
  document.title += ` > ${groupName}`;
  return (
    <div>
      <h2>{groupName}</h2>
      <div>
        <h2>Overview</h2>
        <p>Lorem ipsum</p>
        <h2>All groups</h2>
        <ul>
          <Link to="/study/Study 1/Group 1/P1">
            <li className="link">P1</li>
          </Link>
          <Link to="/study/Study 2/Group 2/P2">
            <li className="link">P2</li>
          </Link>
        </ul>
      </div>
    </div>
  );
}
