import { useRecoilState } from 'recoil';
import { Select } from 'antd';
import { useState } from 'react';
import { unflattenObject } from '../../util/flattenObject';
import { configsState } from '../../assets/state';
import ConfigForm, { IConfigFormValues } from '../organisms/ConfigForm';
import General from '../templates/General';
import {
  IConfigRequest,
  IConfigResponse,
} from '../../../ipc/channels/ConfigChannel';
import IpcService from '../../IpcService';
import { State } from '../../../ipc/interfaces';

const { Option } = Select;

export default function Config(props: any) {
  const { history } = props;
  const [selectedConfigName, setSelectedConfigName] = useState('default');
  const [configs] = useRecoilState(configsState);
  const config = configs[selectedConfigName];

  const action = (values: IConfigFormValues) => {
    const newConfig = unflattenObject(values) as IConfig;
    if (values['measurement.windows']) {
      newConfig.measurement.windows = values['measurement.windows'];
    }
    if (values['chart.showRejected']) {
      newConfig.chart.showRejected = values['chart.showRejected'] as any;
    }

    console.log('NEW', newConfig);
    const request: IConfigRequest = {
      method: 'create',
      query: {
        form: newConfig,
      },
    };
    const responseChannel = IpcService.send('config', request);
    IpcService.on(responseChannel, (e, response: IConfigResponse) => {
      console.log('CREATE CONFIG', e);
      if (response.state === State.Loading) {
        return;
      }
      if (response.state === State.Done) {
        history.push(`/`);
        return;
      }
      throw new Error('Something went wrong');
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
