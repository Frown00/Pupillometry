/* eslint-disable react/no-unused-state */
/* eslint-disable react/state-in-constructor */
import React from 'react';
import { Link } from 'react-router-dom';
import { Channel } from '../../ipc/channels';
import ElectronWindow from '../ElectronWindow';
import DefaultLoader from './Loader';

const pjson = require('../../../package.json');

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

interface IStudy {
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IState {
  isLoading: boolean;
  studies: Array<IStudy>;
  recent: IStudy | null;
}
const { ipcRenderer } = ElectronWindow.get().api;

export default class StartingPage extends React.Component<IProps, IState> {
  // ref!: SVGSVGElement;
  state: Readonly<IState> = {
    isLoading: true,
    studies: [],
    recent: null,
  };

  componentDidMount() {
    // activate
    ipcRenderer.send(Channel.applyForStudies);
    ipcRenderer.on(Channel.getStudies, (value: any) => {
      if (value === 'Loading') {
        this.setState({ isLoading: true });
      } else {
        setTimeout(() => {
          this.setState({ isLoading: false, studies: value });
        }, 500);
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Channel.getStudies);
  }

  render() {
    document.title = pjson.build.productName;
    const { isLoading, studies } = this.state;
    const allStudies = studies.map((s: IStudy) => (
      <Link to={`/study/${s.name}`}>
        <li className="link-page">{s.name}</li>
      </Link>
    ));
    return isLoading ? (
      <DefaultLoader />
    ) : (
      <div>
        <Link to="/form/newStudy">
          <button type="button">New Study</button>
        </Link>
        <br />
        <br />
        <button
          type="button"
          onClick={() => {
            ipcRenderer.send(Channel.clearDB);
            window.location.reload();
          }}
        >
          Remove all
        </button>
        <div>
          <h2>Recent</h2>
          <ul>
            <Link to="/study/Study 1">
              <li className="link-page">Study 1</li>
            </Link>
          </ul>
        </div>
        <br />
        <br />
        <div>
          <h2>All studies</h2>
          <ul>{allStudies}</ul>
        </div>
      </div>
    );
  }
}
