/* eslint-disable react/state-in-constructor */
import { RouteComponentProps } from 'react-router-dom';
import React from 'react';
import ElectronWindow from '../../ElectronWindow';
import { IResponseRespondentPupilData } from '../../../ipc/types';
import GlobalState from '../GlobalState';
import * as configJSON from '../../../main/pupillary/config.json';
import SlidingTabs from './SlidingTabs';
import SelectWithSearch from './SelectWithSearch';
import { Channel, State } from '../../../ipc/channels';
import DefaultLoader from '../Loader';

const DEFAULT_CONFIG = configJSON as IConfig;

interface MatchParams {
  name: string;
  groupName: string;
  respondentName: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

interface IState {
  isLoading: boolean;
  respondent: IRespondentSamples | null;
}
const { ipcRenderer } = ElectronWindow.get().api;

export default class Respondent extends React.Component<MatchProps, IState> {
  // const { name } = props;
  state: Readonly<IState> = {
    isLoading: false,
    respondent: null,
  };

  componentDidMount() {
    // activate
    const { match } = this.props;
    const { name, groupName, respondentName } = match.params;
    const form: IRequestForm = {
      studyName: name,
      groupName,
      respondentName,
    };
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.GetRespondentPupilData,
      form,
    });
    ipcRenderer.on(
      Channel.GetRespondentPupilData,
      (message: IResponseRespondentPupilData) => {
        if (message.state === State.Loading) {
          this.setState({ isLoading: true });
        } else {
          this.setState({
            isLoading: false,
            respondent: message.response,
          });
        }
      }
    );
  }

  // shouldComponentUpdate(nextProps: MatchProps) {
  //   const { match } = this.props;
  //   const { respondentName } = match.params;
  //   const differentName =
  //     respondentName !== nextProps.match.params.respondentName;
  //   return differentName;
  // }

  render() {
    const { match, history } = this.props;
    console.log('MATCH', match);
    const { name, groupName, respondentName } = match.params;
    document.title = `Pupillometry > ${name} > ${groupName} > ${respondentName}`;
    const respondentNames = GlobalState.currentGroup?.respondents.map(
      (r) => r.name
    );
    const { respondent, isLoading } = this.state;

    return (
      <>
        {isLoading ? (
          <DefaultLoader />
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>{respondentName}</h2>
              <SelectWithSearch
                names={respondentNames ?? []}
                history={history}
                params={match.params}
              />
            </div>
            <div>
              <h2>Overview</h2>
              <SlidingTabs
                respondentName={respondent?.name ?? ''}
                segments={respondent?.segments ?? []}
                config={DEFAULT_CONFIG}
              />
            </div>
          </div>
        )}
      </>
    );
  }
}
