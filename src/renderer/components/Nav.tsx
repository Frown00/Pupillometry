import { Link } from 'react-router-dom';
import Logo from '../../../assets/icons/256x256.png';

export default function Nav() {
  return (
    <nav className="start">
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
    </nav>
  );
}
