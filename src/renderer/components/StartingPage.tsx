/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/state-in-constructor */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { removeElement } from '../../util';
import { Channel, State } from '../../ipc/channels';
import ElectronWindow from '../ElectronWindow';
import DefaultLoader from './Loader';
import GlobalState from './GlobalState';
import { IResponseGetStudyAnnotations } from '../../ipc/types';
import StudyTable from './tables/StudyTable';

const pjson = require('../../../package.json');

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

export interface IStudyRecord {
  key: string;
  name: string;
  groups: number;
  respondents: number;
}

function createRecords(annotations: IStudyAnnotation[]) {
  const records = [];
  for (let i = 0; i < annotations.length; i += 1) {
    const r: IStudyRecord = {
      key: i.toString(),
      groups: 0,
      name: annotations[i].name,
      respondents: 0,
    };
    records.push(r);
  }
  return records;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IState {
  isLoading: boolean;
  studyRecords: IStudyRecord[];
  recent: IStudy | null;
}
const { ipcRenderer } = ElectronWindow.get().api;

export default class StartingPage extends React.Component<IProps, IState> {
  // ref!: SVGSVGElement;
  state: Readonly<IState> = {
    isLoading: true,
    studyRecords: [],
    recent: null,
  };

  constructor(props: IProps) {
    super(props);
    this.handleOnDelete = this.handleOnDelete.bind(this);
  }

  componentDidMount() {
    // activate
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.GetStudyAnnotations,
    });
    ipcRenderer.on(
      Channel.GetStudyAnnotations,
      (message: IResponseGetStudyAnnotations) => {
        if (message.state === State.Loading) {
          this.setState({ isLoading: true });
        } else if (message.state === State.Done) {
          setTimeout(() => {
            console.log(message.response);
            this.setState({
              isLoading: false,
              studyRecords: createRecords(message.response),
            });
            GlobalState.studyAnnotations = message.response;
          }, 500);
        }
      }
    );
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Channel.GetStudyAnnotations);
  }

  handleOnDelete(record: IStudyRecord) {
    console.log(record);
    const { studyRecords } = this.state;
    const removed = removeElement(studyRecords, 'name', record.name);
    ipcRenderer.send(Channel.DeleteStudy, { name: removed.name });
    this.setState({ studyRecords });
  }

  render() {
    document.title = pjson.build.productName;
    const { isLoading, studyRecords } = this.state;
    const allStudies = studyRecords?.map((s: IStudyRecord) => (
      <Link key={s.key} to={`/study/${s.name}`}>
        <li className="link-page">{s.name}</li>
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
          <StudyTable
            handleOnDelete={this.handleOnDelete}
            records={studyRecords}
          />
          {/* <ul>{allStudies}</ul> */}
        </div>
      </div>
    );
  }
}
