import { Tabs, Radio, RadioChangeEvent } from 'antd';
import { useState } from 'react';

interface IProps {
  tabPanes: JSX.Element[]; // TabPanes
  width: number;
  height: number;
  activeKey?: string;
  defaultMode?: 'top' | 'left';
}

interface IState {
  mode: 'top' | 'left';
}

export default function SlidingTabs(props: IProps) {
  const { tabPanes, width, height, activeKey, defaultMode } = props;
  const [state, setState] = useState<IState>({ mode: defaultMode ?? 'top' });
  const handleModeChange = (e: RadioChangeEvent) => {
    const mode = e.target.value;
    setState({ mode });
  };

  return (
    <div
      style={{
        width: state.mode === 'top' ? Math.max(width, 300) : '',
      }}
    >
      <Radio.Group
        onChange={handleModeChange}
        value={state.mode}
        style={{ marginBottom: 8 }}
      >
        <Radio.Button value="top">Horizontal</Radio.Button>
        <Radio.Button value="left">Vertical</Radio.Button>
      </Radio.Group>
      <Tabs
        defaultActiveKey={activeKey}
        tabPosition={state.mode}
        style={{
          height: state.mode === 'left' ? Math.max(height, 300) : '',
        }}
      >
        {tabPanes.map((tab: JSX.Element) => tab)}
      </Tabs>
    </div>
  );
}

SlidingTabs.defaultProps = {
  activeKey: '1',
  defaultMode: 'top',
};
