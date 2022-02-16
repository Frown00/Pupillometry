import { useRecoilState } from 'recoil';
import { Select } from 'antd';
import { useState } from 'react';
import { unflattenObject } from '../../util/flattenObject';
import { IMessage } from '../../../ipc/types';
import { Channel, State } from '../../../ipc/channels';
import ElectronWindow from '../../ElectronWindow';
import { configsState } from '../../assets/state';
import ConfigForm, { IConfigFormValues } from '../organisms/ConfigForm';
import General from '../templates/General';

const { ipcRenderer } = ElectronWindow.get().api;

const { Option } = Select;

export default function Config(props: any) {
  const { history } = props;
  const [selectedConfigName, setSelectedConfigName] = useState('default');
  const [configs] = useRecoilState(configsState);
  const config = configs[selectedConfigName];

  const action = (values: IConfigFormValues) => {
    const newConfig = unflattenObject(values) as IConfig;
    const request: IRequestForm = { config: newConfig };
    ipcRenderer.send(Channel.Request, {
      responseChannel: Channel.CreateConfig,
      form: request,
    });
    ipcRenderer.on(Channel.CreateConfig, (message: IMessage) => {
      if (message.state === State.Loading) {
        //
      } else if (message.state === State.Done) {
        history.push(`/`);
      } else throw new Error('Something went wrong');
    });
  };
  const options = Object.keys(configs).map((configName) => (
    <Option key={configName}>{configName}</Option>
  ));

  const onChange = (configName: string) => {
    setSelectedConfigName(configName);
  };

  return (
    <General>
      <Select
        placeholder="Select a base config"
        onChange={onChange}
        style={{ marginBottom: '20px', width: '200px' }}
      >
        {options}
      </Select>
      <ConfigForm
        title="Create / Edit Config"
        selectedConfig={config}
        action={action}
      />
    </General>
  );
}
