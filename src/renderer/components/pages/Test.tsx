import { Button, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { State } from '../../../ipc/interfaces';
import { unflattenObject } from '../../util/flattenObject';
import { configsState } from '../../assets/state';
import Title from '../atoms/Title';
import ConfigForm, { IConfigFormValues } from '../organisms/ConfigForm';
import SegmentedLineGraph from '../organisms/SegmentedLineGraph';
import General from '../templates/General';
import DefaultLoader from '../atoms/Loader';
import IpcService from '../../IpcService';
import {
  IPupillometryRequest,
  IPupillometryResponse,
} from '../../../ipc/channels/PupillometryChannel';

const { Option } = Select;

export default function Test() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfigMode, setIsConfigMode] = useState<boolean>(false);
  const [pupilData, setPuilData] = useState<IPupillometryResult>();
  const [configs] = useRecoilState(configsState);
  const [config, setConfig] = useState<IConfig>(configs.default);

  const responseChannel = 'pupillometry_response';

  useEffect(() => {
    setConfig((prev) => ({ ...prev, name: 'test' }));
    IpcService.on(responseChannel, (_, response: IPupillometryResponse) => {
      if (response.state === State.Done) {
        console.log('RESPONSE', response);
        setIsLoading(false);
        setPuilData(response.result[0] ?? null);
      }
    });
    return () => {
      IpcService.removeAllListeners(responseChannel);
    };
  }, []);

  const toggleConfig = () => {
    setIsConfigMode(!isConfigMode);
  };
  const onConfigChange = (values: IConfigFormValues) => {
    const testConfig = unflattenObject(values) as IConfig;
    if (values['measurement.windows']) {
      testConfig.measurement.windows = values['measurement.windows'];
    }
    if (values['chart.showRejected']) {
      testConfig.chart.showRejected = values['chart.showRejected'] as any;
    }
    setConfig(testConfig);
    setIsConfigMode(false);
  };

  const onChange = (configName: string) => {
    const cfg = configs[configName];
    setConfig(cfg);
  };

  const loader = isLoading ? <DefaultLoader /> : undefined;
  const options = Object.keys(configs).map((configName) => (
    <Option key={configName}>{configName}</Option>
  ));

  return (
    <General Loader={loader}>
      <Title level={1}>Test your samples</Title>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '350px',
          marginBottom: '20px',
        }}
      >
        <Button
          style={{ minWidth: 150 }}
          type="primary"
          onClick={() => {
            const request: IPupillometryRequest = {
              method: 'test',
              query: {
                form: {
                  config,
                },
              },
              responseChannel,
            };
            IpcService.send('pupillometry', request);
            setIsLoading(true);
          }}
        >
          Process
        </Button>
        <Button style={{ minWidth: 150 }} onClick={toggleConfig}>
          {isConfigMode ? 'Show Metrics' : 'Change Config'}
        </Button>
      </div>
      {isConfigMode ? (
        <>
          {' '}
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
            action={onConfigChange}
          />
        </>
      ) : (
        <SegmentedLineGraph
          config={config}
          respondentName={pupilData?.name ?? ''}
          segments={pupilData?.segments ?? []}
        />
      )}
    </General>
  );
}
