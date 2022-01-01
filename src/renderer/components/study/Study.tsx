import { Link, RouteComponentProps } from 'react-router-dom';

interface MatchParams {
  name: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

export default function Study(props: MatchProps) {
  const { match } = props;
  const studyName = match.params.name;
  document.title += ` > ${studyName}`;
  return (
    <div>
      <h2>{studyName}</h2>
      <div>
        <button type="button" onClick={() => console.log('Create new group')}>
          Create New Group
        </button>
        <h2>All groups</h2>
        <ul>
          <Link to="/study/Study 1/Group 1">
            <li className="link-page">Group 1</li>
          </Link>
          <Link to="/study/Study 2/Group 2">
            <li className="link-page">Group 2</li>
          </Link>
        </ul>
      </div>
    </div>
  );
}
