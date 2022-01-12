/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/state-in-constructor */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { Channel } from '../../ipc/channels';
import ElectronWindow from '../ElectronWindow';
import DefaultLoader from './Loader';
import GlobalState from './GlobalState';

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
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.GetStudies,
    });
    ipcRenderer.on(Channel.GetStudies, (studies: any) => {
      if (studies === 'loading') {
        this.setState({ isLoading: true });
      } else {
        setTimeout(() => {
          this.setState({ isLoading: false, studies });
          GlobalState.studies = studies;
        }, 500);
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Channel.GetStudies);
  }

  render() {
    document.title = pjson.build.productName;
    const { isLoading, studies } = this.state;
    const allStudies = studies.map((s: IStudy) => (
      <Link to={`/study/${s.name}`}>
        <li key={s.name} className="link-page">
          {s.name}
        </li>
      </Link>
    ));
    return isLoading ? (
      <DefaultLoader />
    ) : (
      <div>
        <Link to="/form/newStudy">
          <Button type="primary">New Study</Button>
        </Link>
        <br />
        <br />
        <Button
          onClick={() => {
            ipcRenderer.send(Channel.ClearDB);
            window.location.reload();
          }}
        >
          Remove All
        </Button>
        <div>
          <h2>Recent</h2>
          <ul>
            <Link to="/study/Study 1">
              <li key="example" className="link-page">
                Study 1
              </li>
            </Link>
          </ul>
        </div>
        <br />
        <br />
        <div>
          <h2>All studies</h2>
          {/* <TestForm /> */}
          <ul>{allStudies}</ul>
        </div>
      </div>
    );
  }
}
