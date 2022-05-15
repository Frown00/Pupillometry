/* eslint-disable react/require-default-props */
/* eslint-disable react/no-unused-prop-types */
import { Segmented, Space, Tabs } from 'antd';
import { SegmentedValue } from 'antd/lib/segmented';
import d3ToPng from 'd3-svg-to-png';
import { useState } from 'react';
import Button from '../atoms/Button';
import SlidingTabs from '../molecules/SlidingTabs';
import LineGraph from './LineGraph';
import Metrics from './Metrics';

const { TabPane } = Tabs;

interface IProps {
  segments: IPupillometry[];
  config: IConfig;
  respondent: IPupillometryResult | null;
  changeValidity?: (segmentName: string, classification: SegmentClass) => void;
}

export type ChartOption =
  | 'Mean'
  | 'Minus Baseline'
  | 'Divide By Baseline'
  | 'Z-Score'
  | 'Z-Score -Baseline'
  | 'Z-Score /Baseline'
  | 'Relative'
  | 'PCPD (ERPD)';

export default function SegmentedLineGraph(props: IProps) {
  const { segments, config, respondent, changeValidity } = props;

  const [chartType, setChartType] = useState<ChartOption>('Mean');

  const chartOptions: ChartOption[] = [
    'Mean',
    'Minus Baseline',
    'Divide By Baseline',
    'Z-Score',
    'Z-Score -Baseline',
    'Z-Score /Baseline',
    'Relative',
    'PCPD (ERPD)',
  ];
  const onChange = (value: SegmentedValue) => {
    setChartType(value as ChartOption);
  };
  const getStats = (s: IPupillometry) => {
    if (chartType === 'Minus Baseline')
      return s.baseline?.minusStats ?? s.stats;
    if (chartType === 'Divide By Baseline')
      return s.baseline?.divideStats ?? s.stats;
    if (chartType === 'Z-Score') return s.zscore?.standard ?? s.stats;
    if (chartType === 'Z-Score -Baseline')
      return s.zscore?.minusBaseline ?? s.stats;
    if (chartType === 'Z-Score /Baseline')
      return s.zscore?.divideBaseline ?? s.stats;
    if (chartType === 'Relative') return s.percent?.relative ?? s.stats;
    if (chartType === 'PCPD (ERPD)') return s.percent?.erpd ?? s.stats;
    return s.stats;
  };
  const respondentName = respondent?.name ?? '';
  const charts = {
    Mean: (s: IPupillometry) => (
      <LineGraph
        config={config}
        samples={s}
        name={respondentName}
        chartType="Mean"
      />
    ),
    'Minus Baseline': (s: IPupillometry) => (
      <LineGraph
        config={config}
        samples={s}
        name={respondentName}
        chartType="Minus Baseline"
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
    'Z-Score': (s: IPupillometry) => (
      <LineGraph
        config={config}
        samples={s}
        name={respondentName}
        chartType="Z-Score"
      />
    ),
    'Z-Score -Baseline': (s: IPupillometry) => (
      <LineGraph
        config={config}
        samples={s}
        name={respondentName}
        chartType="Z-Score -Baseline"
      />
    ),
    'Z-Score /Baseline': (s: IPupillometry) => (
      <LineGraph
        config={config}
        samples={s}
        name={respondentName}
        chartType="Z-Score /Baseline"
      />
    ),
    Relative: (s: IPupillometry) => (
      <LineGraph
        config={config}
        samples={s}
        name={respondentName}
        chartType="Relative"
      />
    ),
    'PCPD (ERPD)': (s: IPupillometry) => (
      <LineGraph
        config={config}
        samples={s}
        name={respondentName}
        chartType="PCPD (ERPD)"
      />
    ),
  };

  const getChart = (name: ChartOption, p: IPupillometry) => {
    return charts[name](p);
  };

  const panes = segments.map((s) => (
    <TabPane tab={`${s.name}`} key={s.name}>
      <Space direction="vertical">
        <Button
          onClick={() => {
            // React master race developers would hate me for that
            const d = document.querySelector(
              '.ant-tabs-content.ant-tabs-content-top'
            );
            const tabId = (d?.childNodes[0] as any).getAttribute('id');
            const temp = tabId.split('-');
            temp.pop();
            temp.push(s.name);
            const selelectorId = temp.join('-');
            d3ToPng(
              `div[id="${selelectorId}"] svg.container`,
              `${respondentName}-${s.name}-${chartType}`,
              {
                scale: 3,
                format: 'png',
                quality: 1,
              }
            ).catch((err) => {
              throw new Error('Cannot save file', err);
            });
          }}
        >
          Save as PNG
        </Button>
        <Button
          type="primary"
          onClick={() =>
            changeValidity ? changeValidity(s.name, s.classification) : null
          }
        >
          Mark as {s.classification === 'Valid' ? 'Invalid' : 'Valid'}
        </Button>
        {getChart(chartType, s)}
        <Metrics
          stats={getStats(s)}
          respondent={respondent}
          segment={s}
          isSmoothed={config.smoothing.on}
        />
      </Space>
    </TabPane>
  ));
  const width = Math.max(900, config.chart.width + 10);
  const height = config.chart.height + 250;
  return (
    <Space direction="vertical">
      <Segmented
        options={chartOptions}
        onChange={(v: SegmentedValue) => onChange(v)}
      />
      <SlidingTabs tabPanes={panes} width={width} height={height} />
    </Space>
  );
}
