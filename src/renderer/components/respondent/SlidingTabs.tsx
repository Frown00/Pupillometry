/* eslint-disable @typescript-eslint/no-empty-interface */
import { Tabs, Radio } from 'antd';
import React from 'react';
import Chart from '../charts/Chart';

const { TabPane } = Tabs;

interface IProps {
  segments: IPupillometry[];
  config: IConfig;
  respondentName: string;
}

interface IState {
  mode: any;
}

export default class SlidingTabs extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      mode: 'top',
    };
  }

  handleModeChange = (e: any) => {
    const mode = e.target.value;
    this.setState({ mode });
  };

  render() {
    const { mode } = this.state;
    const { segments, config, respondentName } = this.props;

    return (
      <div style={{ width: mode === 'top' ? config.chart.width + 10 : '' }}>
        <Radio.Group
          onChange={this.handleModeChange}
          value={mode}
          style={{ marginBottom: 8 }}
        >
          <Radio.Button value="top">Horizontal</Radio.Button>
          <Radio.Button value="left">Vertical</Radio.Button>
        </Radio.Group>
        <Tabs
          defaultActiveKey="1"
          tabPosition={mode}
          style={{ height: mode === 'left' ? config.chart.height + 300 : '' }}
        >
          {segments.map((s) => (
            <TabPane tab={`${s.name}`} key={s.name}>
              <Chart config={config} samples={s} name={respondentName} />
            </TabPane>
          ))}
        </Tabs>
      </div>
    );
  }
}
