/* eslint-disable react/state-in-constructor */
import { Button } from 'antd';
import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import ElectronWindow from '../../ElectronWindow';
import { Channel, State } from '../../../ipc/channels';
import GlobalState from '../GlobalState';
import { IResponseGetStudy } from '../../../ipc/types';
import DefaultLoader from '../Loader';

interface MatchParams {
  name: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

interface IState {
  isLoading: boolean;
  study: IStudy | null | undefined;
}
const { ipcRenderer } = ElectronWindow.get().api;
export default class Study extends React.Component<MatchProps, IState> {
  state: Readonly<IState> = {
    isLoading: true,
    study: null,
  };

  componentDidMount() {
    // activate
    const { match } = this.props;
    document.title += ` > ${match.params.name}`;
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.GetStudy,
      form: { study: match.params.name },
    });
    ipcRenderer.on(Channel.GetStudy, (message: IResponseGetStudy) => {
      if (message.state === State.Loading) {
        this.setState({ isLoading: true });
      } else {
        console.log(message.response);
        this.setState({ isLoading: false, study: message.response });
        // GlobalState.studies = studies;
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Channel.GetStudy);
  }

  render() {
    const { match } = this.props;
    const { isLoading, study } = this.state;
    const studyName = match.params.name;
    if (!GlobalState.currentStudy)
      GlobalState.currentStudy = {
        name: studyName,
        groups: study?.groups ?? [],
      };
    GlobalState.currentStudy.name = studyName;
    GlobalState.currentStudy.groups = study?.groups ?? [];
    console.log('STUDY GROUPS', study?.groups);
    const allGroups = study?.groups?.map((g: IGroup) => (
      <Link key={g.name} to={`/study/${studyName}/${g.name}`}>
        <li className="link-page">{g.name}</li>
      </Link>
    ));
    return (
      <div>
        <h2>{studyName}</h2>
        {isLoading ? (
          <DefaultLoader />
        ) : (
          <div>
            <Link to="/form/newGroup">
              <Button type="primary">New Group</Button>
            </Link>

            <Button type="default" style={{ marginLeft: '10px' }}>
              Export
            </Button>
            <h2>All groups</h2>
            <ul>{allGroups}</ul>
          </div>
        )}
      </div>
    );
  }
}
