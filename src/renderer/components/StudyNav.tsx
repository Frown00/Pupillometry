import { Link, RouteComponentProps } from 'react-router-dom';
import Logo from '../../../assets/icons/256x256.png';

export default function StudyNav(props: RouteComponentProps) {
  const { location } = props;
  const studyName = location.pathname.split('/')[2];
  const studyPath = `/study/${studyName}`;
  const groupName = location.pathname.split('/')[3];
  const groupPath = `/study/${studyName}/${groupName}`;

  return (
    <nav className="study">
      <Link to="/">
        <div
          style={{
            width: '50px',
            height: '50px',
            overflow: 'hidden',
            borderRadius: '50%',
          }}
        >
          <img className="logo" src={Logo} alt="" />
        </div>
      </Link>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-between',
          minHeight: '100%',
        }}
      >
        <div>
          <Link to={studyPath}>
            <li className="side-nav-link">{studyName}</li>
          </Link>
          {groupName ? (
            <Link to={groupPath}>
              <li className="side-nav-link">{groupName}</li>
            </Link>
          ) : (
            ''
          )}
        </div>
        <div style={{ alignItems: 'space-around' }}>
          <ul>
            <Link to="/test">
              <li className="side-nav-link">Test</li>
            </Link>
            <Link to="/about">
              <li className="side-nav-link">About</li>
            </Link>
            <Link to="/settings">
              <li className="side-nav-link">Config</li>
            </Link>
          </ul>
        </div>
      </div>
    </nav>
  );
}
