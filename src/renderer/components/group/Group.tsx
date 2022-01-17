/* eslint-disable react/state-in-constructor */
import { Button } from 'antd';
import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import ElectronWindow from '../../ElectronWindow';
import { removeElement } from '../../../util';
import { Channel } from '../../../ipc/channels';
import GlobalState from '../GlobalState';
import RespondentTable from '../respondent/RespondentTable';

export interface IRespondentRecord {
  key: string;
  name: string;
  validity: string;
  pupilCorrelation: number;
  missing: number;
  min: number;
  max: number;
  mean: number;
  std: number;
}

function createRecords(respondents: IRespondentSamples[]) {
  const records = [];
  for (let i = 0; i < respondents.length; i += 1) {
    const r: IRespondentRecord = {
      key: i.toString(),
      name: respondents[i].name,
      validity: 'Valid',
      pupilCorrelation: 0,
      min: 0,
      max: 0,
      mean: 0,
      missing: 0,
      std: 0,
    };
    records.push(r);
  }
  return records;
}

interface MatchParams {
  name: string;
  groupName: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

interface IState {
  respondentRecords: IRespondentRecord[];
}

const { ipcRenderer } = ElectronWindow.get().api;

export default class Group extends React.Component<MatchProps, IState> {
  state: IState = {
    respondentRecords: [],
  };

  constructor(props: MatchProps) {
    super(props);
    this.handleOnDelete = this.handleOnDelete.bind(this);
  }

  componentDidMount() {
    const { match } = this.props;
    const { groupName } = match.params;
    const group = GlobalState.currentStudy?.groups?.find(
      (g) => g.name === groupName
    );
    if (group) {
      this.setState({
        respondentRecords: createRecords(group.respondents),
      });
    }
  }

  handleOnDelete(record: IRespondentRecord) {
    console.log(record);
    const { match } = this.props;
    const studyName = match.params.name;
    const { groupName } = match.params;
    const { respondentRecords } = this.state;
    const removed = removeElement(respondentRecords, 'name', record.name);
    ipcRenderer.send(Channel.DeleteRespondent, {
      groupName,
      studyName,
      respondentName: removed.name,
    });
    this.setState({ respondentRecords });
  }

  render() {
    const { match } = this.props;
    const { name, groupName } = match.params;
    const studyName = GlobalState?.currentStudy?.name ?? '';
    const { respondentRecords } = this.state;
    document.title = `Pupillometry > ${name} > ${groupName}`;
    const group = GlobalState.currentStudy?.groups?.find(
      (g) => g.name === groupName
    );
    GlobalState.currentGroup = group;
    console.log('GROUPS', group);
    const dependent = group?.isDependant ? 'Dependent' : 'Independent';

    return (
      <div>
        <h2>Overview</h2>
        <p>{dependent}</p>
        <Link to={`/form/${studyName}/${groupName}/addRespondent`}>
          <Button type="primary">Add Respondent</Button>
        </Link>
        <h2>All respondents</h2>
        <ul>
          <RespondentTable
            handleOnDelete={this.handleOnDelete}
            records={respondentRecords}
            studyName={studyName}
            groupName={groupName}
          />
        </ul>
      </div>
    );
  }
}
