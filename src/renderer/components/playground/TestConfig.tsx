/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/jsx-props-no-spreading */
import { Select } from 'antd';
import React from 'react';
import { Channel, State } from '../../../ipc/channels';
import { IResponseGetConfigs } from '../../../ipc/types';
import ElectronWindow from '../../ElectronWindow';
import TestConfigForm from './TestConfigForm';

const { Option } = Select;

const { ipcRenderer } = ElectronWindow.get().api;

interface IProps {
  onChange: any;
}

interface IState {
  selectedConfig: string;
  configs: IConfigMap;
}

class TestConfig extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      configs: {},
      selectedConfig: '',
    };
    this.onSelectChange = this.onSelectChange.bind(this);
  }

  componentDidMount() {
    // activate
    document.title = `Pupillometry > Create Config`;
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.GetConfigs,
    });
    ipcRenderer.on(Channel.GetConfigs, (message: IResponseGetConfigs) => {
      console.log(message);
      if (message.state === State.Loading) {
        // this.setState({ isLoading: true });
      } else {
        this.setState({
          configs: message.response,
        });
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Channel.GetConfigs);
  }

  onSelectChange(e: any) {
    this.setState({ selectedConfig: e });
  }

  render() {
    const { configs, selectedConfig } = this.state;
    const { onChange } = this.props;
    console.log('C', this.props);
    const selected = configs[selectedConfig] ?? {};
    const values: string[] = Object.keys(configs);
    const options = values.map((v) => (
      <Option key={v} value={v}>
        {v}
      </Option>
    ));

    console.log('TTETETET', selected);
    return (
      <>
        <Select
          placeholder="Please select a config"
          onChange={this.onSelectChange}
        >
          {options}
        </Select>
        <TestConfigForm config={selected} onChange={onChange} />
      </>
    );
  }
}

export default TestConfig;
