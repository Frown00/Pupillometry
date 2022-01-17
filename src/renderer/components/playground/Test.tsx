import React from 'react';
import { Button } from 'antd';
import ElectronWindow from '../../ElectronWindow';
import Chart from '../charts/Chart';
import * as configJSON from '../../../main/pupillary/config.json';
import { Channel } from '../../../ipc/channels';
import SlidingTabs from '../respondent/SlidingTabs';

const DEFAULT_CONFIG = configJSON as IConfig;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}
interface IState {
  isConfig: boolean;
  config: IConfig;
  respondent: IRespondentSamples;
  update: number;
}
const { ipcRenderer } = ElectronWindow.get().api;

export default class Test extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      isConfig: false,
      config: DEFAULT_CONFIG,
      respondent: {
        name: '',
        segments: [],
      },
      update: 0,
    };
    this.setConfig = this.setConfig.bind(this);
    this.toggleConfig = this.toggleConfig.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on(
      Channel.GetValidPupilSamples,
      (respondent: IRespondentSamples) => {
        const { update } = this.state;
        const u = update + 1;
        this.setState({
          respondent,
          update: u,
        });
      }
    );
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Channel.GetValidPupilSamples);
  }

  setConfig(newConfig: IConfig) {
    this.setState({ config: newConfig });
  }

  toggleConfig() {
    const { isConfig } = this.state;
    this.setState({ isConfig: !isConfig });
  }

  render() {
    const { isConfig, config, respondent } = this.state;
    const { segments } = respondent;
    const charts = segments.map((segment) => (
      <li key={segment.name}>
        <Chart config={config} samples={segment} name={respondent.name} />
      </li>
    ));
    return (
      <div>
        <h2>Test your samples</h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '600px',
          }}
        >
          <Button
            onClick={() =>
              ElectronWindow.get().api.ipcRenderer.processPupil(config)
            }
          >
            Process
          </Button>
          <Button onClick={this.toggleConfig}>Config</Button>
        </div>
        {isConfig ? (
          <div>Config</div>
        ) : (
          <SlidingTabs
            respondentName={respondent?.name ?? ''}
            segments={respondent?.segments ?? []}
            config={DEFAULT_CONFIG}
          />
        )}
      </div>
    );
  }
}
