import { Tabs } from 'antd';
import SlidingTabs from '../molecules/SlidingTabs';
import LineGraph from './LineGraph';

const { TabPane } = Tabs;

interface IProps {
  segments: IPupillometry[];
  config: IConfig;
  respondentName: string;
}

export default function SegmentedLineGraph(props: IProps) {
  const { segments, config, respondentName } = props;
  const panes = segments.map((s) => (
    <TabPane tab={`${s.name}`} key={s.name}>
      <p>{s.isValid}</p>
      <LineGraph config={config} samples={s} name={respondentName} />
    </TabPane>
  ));
  const width = config.chart.width + 10;
  const height = config.chart.height + 250;
  return <SlidingTabs tabPanes={panes} width={width} height={height} />;
}
