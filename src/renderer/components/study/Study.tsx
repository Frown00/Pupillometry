/* eslint-disable react/state-in-constructor */
import { Button } from 'antd';
import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { removeElement } from '../../../util';
import ElectronWindow from '../../ElectronWindow';
import { Channel, State } from '../../../ipc/channels';
import GlobalState from '../GlobalState';
import { IResponseGetStudy } from '../../../ipc/types';
import DefaultLoader from '../Loader';
import GroupTable from '../group/GroupTable';

export interface IGroupRecord {
  key: string;
  name: string;
  respondents: number;
}

function createRecords(groups: IGroup[]) {
  const records = [];
  for (let i = 0; i < groups.length; i += 1) {
    const r: IGroupRecord = {
      key: i.toString(),
      name: groups[i].name,
      respondents: groups[i].respondents.length,
    };
    records.push(r);
  }
  return records;
}

interface MatchParams {
  name: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

interface IState {
  isLoading: boolean;
  study: IStudy | null | undefined;
  groupRecords: IGroupRecord[];
}
const { ipcRenderer } = ElectronWindow.get().api;
export default class Study extends React.Component<MatchProps, IState> {
  state: Readonly<IState> = {
    isLoading: true,
    study: null,
    groupRecords: [],
  };

  constructor(props: MatchProps) {
    super(props);
    this.handleOnDelete = this.handleOnDelete.bind(this);
  }

  componentDidMount() {
    // activate
    const { match } = this.props;
    document.title = `Pupillometry > ${match.params.name}`;
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.GetStudy,
      form: { study: match.params.name },
    });
    ipcRenderer.on(Channel.GetStudy, (message: IResponseGetStudy) => {
      if (message.state === State.Loading) {
        this.setState({ isLoading: true });
      } else {
        this.setState({
          isLoading: false,
          study: message.response,
          groupRecords: createRecords(message.response?.groups ?? []),
        });
        // GlobalState.studies = studies;
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Channel.GetStudy);
  }

  handleOnDelete(record: IGroupRecord) {
    const { match } = this.props;
    const studyName = match.params.name;
    const { groupRecords } = this.state;
    const removed = removeElement(groupRecords, 'name', record.name);
    ipcRenderer.send(Channel.DeleteGroup, {
      groupName: removed.name,
      studyName,
    });
    this.setState({ groupRecords });
  }

  render() {
    const { match } = this.props;
    const { isLoading, study, groupRecords } = this.state;
    const studyName = match.params.name;
    if (!GlobalState.currentStudy)
      GlobalState.currentStudy = {
        name: studyName,
        groups: study?.groups ?? [],
      };
    GlobalState.currentStudy.name = studyName;
    GlobalState.currentStudy.groups = study?.groups ?? [];

    return (
      <div>
        {isLoading ? (
          <DefaultLoader />
        ) : (
          <div>
            <Link to={`/form/${studyName}/newGroup`}>
              <Button type="primary">New Group</Button>
            </Link>

            <Button
              onClick={() =>
                ipcRenderer.send(Channel.ExportMetrics, {
                  name: studyName,
                  groups: [],
                })
              }
              type="default"
              style={{ marginLeft: '10px' }}
            >
              Export
            </Button>
            <h2>All groups</h2>
            <GroupTable
              handleOnDelete={this.handleOnDelete}
              records={groupRecords}
              studyName={studyName}
            />
          </div>
        )}
      </div>
    );
  }
}
