import { Segmented, Tabs } from 'antd';
import { SegmentedValue } from 'antd/lib/segmented';
import { useState } from 'react';
import SlidingTabs from '../molecules/SlidingTabs';
import LineGraph from './LineGraph';
import Metrics from './Metrics';

const { TabPane } = Tabs;

interface IProps {
  segments: IPupillometry[];
  config: IConfig;
  respondentName: string;
}

export type ChartOption = 'Mean' | 'Substract Baseline' | 'Divide By Baseline';

export default function SegmentedLineGraph(props: IProps) {
  const { segments, config, respondentName } = props;

  const [chartType, setChartType] = useState<ChartOption>('Mean');
  const chartOptions: ChartOption[] = [
    'Mean',
    'Substract Baseline',
    'Divide By Baseline',
  ];
  const onChange = (value: SegmentedValue) => {
    setChartType(value as ChartOption);
  };
  const getStats = (s: IPupillometry) => {
    if (chartType === 'Substract Baseline')
      return s.baseline?.substractStats ?? s.stats;
    if (chartType === 'Divide By Baseline')
      return s.baseline?.divideStats ?? s.stats;
    return s.stats;
  };
  const charts = {
    Mean: (s: IPupillometry) => (
      <LineGraph
        config={config}
        samples={s}
        name={respondentName}
        chartType="Mean"
      />
    ),
    'Substract Baseline': (s: IPupillometry) => (
      <LineGraph
        config={config}
        samples={s}
        name={respondentName}
        chartType="Substract Baseline"
      />
    ),
    'Divide By Baseline': (s: IPupillometry) => (
      <LineGraph
        config={config}
        samples={s}
        name={respondentName}
        chartType="Divide By Baseline"
      />
    ),
  };

  const getChart = (name: ChartOption, p: IPupillometry) => {
    return charts[name](p);
  };

  const panes = segments.map((s) => (
    <TabPane tab={`${s.name}`} key={s.name}>
      {getChart(chartType, s)}
      <Metrics
        respondentName={respondentName}
        segmentName={s.name}
        classification={s.classification}
        duration={s.duration}
        sampleRate={s.sampleRate}
        stats={getStats(s)}
        baseline={s.baseline?.value ?? NaN}
      />
    </TabPane>
  ));
  const width = config.chart.width + 10;
  const height = config.chart.height + 250;
  return (
    <>
      <Segmented
        options={chartOptions}
        onChange={(v: SegmentedValue) => onChange(v)}
        block
      />
      <SlidingTabs tabPanes={panes} width={width} height={height} />
    </>
  );
}
