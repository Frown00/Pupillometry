import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Channel } from '../../../ipc/channels';
import { unflattenObject } from '../../util/flattenObject';
import { configsState } from '../../assets/state';
import ElectronWindow from '../../ElectronWindow';
import Title from '../atoms/Title';
import ConfigForm, { IConfigFormValues } from '../organisms/ConfigForm';
import SegmentedLineGraph from '../organisms/SegmentedLineGraph';
import General from '../templates/General';
import DefaultLoader from '../atoms/Loader';

const { ipcRenderer } = ElectronWindow.get().api;

export default function Test() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfigMode, setIsConfigMode] = useState<boolean>(false);
  const [pupilData, setPuilData] = useState<IRespondentSamples>();
  const [configs] = useRecoilState(configsState);
  const [config, setConfig] = useState<IConfig>(configs.default);

  useEffect(() => {
    setConfig((prev) => ({ ...prev, name: 'test' }));
    ipcRenderer.on(
      Channel.GetValidPupilSamples,
      (respondent: IRespondentSamples) => {
        setPuilData(respondent);
        setIsLoading(false);
      }
    );
    return () => {
      ipcRenderer.removeAllListeners(Channel.GetValidPupilSamples);
    };
  }, []);

  const toggleConfig = () => {
    setIsConfigMode(!isConfigMode);
  };
  const onConfigChange = (values: IConfigFormValues) => {
    const testConfig = unflattenObject(values) as IConfig;
    setConfig(testConfig);
    setIsConfigMode(false);
  };

  const loader = isLoading ? <DefaultLoader /> : undefined;
  return (
    <General Loader={loader}>
      <Title level={1}>Test your samples</Title>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '600px',
          marginBottom: '20px',
        }}
      >
        <Button
          type="primary"
          onClick={() => {
            ipcRenderer.processPupil(config);
            setIsLoading(true);
          }}
        >
          Process
        </Button>
        <Button onClick={toggleConfig}>
          {isConfigMode ? 'Show Metrics' : 'Change Config'}
        </Button>
      </div>
      {isConfigMode ? (
        <ConfigForm
          title="Create / Edit Config"
          selectedConfig={config}
          action={onConfigChange}
        />
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
