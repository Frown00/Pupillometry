import { Collapse, Form as AntForm, Select, Space, Tabs } from 'antd';
import { flattenObject } from '../../util/flattenObject';
import NumberItem from '../molecules/form/NumberItem';
import SelectItem from '../molecules/form/SelectItem';
import SwitchItem from '../molecules/form/SwitchItem';
import TextItem from '../molecules/form/TextItem';
import Form from './Form';

const { Panel } = Collapse;
const { Option } = Select;
const { TabPane } = Tabs;

function callback(key: string | string[]) {}

export interface IConfigFormValues {
  name: string;
  'file.separator': string;
  'file.timestamp': string;
  'file.leftPupil': string;
  'file.rightPupil': string;
  'file.segmentActive': string;

  'chart.width': number;
  'chart.height': number;
  'chart.showEyesPlot': boolean;
  'chart.showMeanPlot': boolean;
  'chart.showSmoothed': boolean;
  'chart.showRejected': string[];

  'measurement.eye': 'left' | 'right' | 'both';
  'measurement.baseline.type': string;
  'measurement.baseline.param': number | string;
  'measurement.segmentation': string;
  'measurement.windows': string[];

  'markers.outOfRange.min': number;
  'markers.outOfRange.max': number;

  'markers.dilatationSpeed.on': boolean;
  'markers.dilatationSpeed.thresholdMultiplier': number;
  'markers.dilatationSpeed.gapMinimumDuration': number;
  'markers.dilatationSpeed.gapMaximumDuration': number;
  'markers.dilatationSpeed.backwardGapPadding': number;
  'markers.dilatationSpeed.forwardGapPadding': number;

  'markers.trendLineDeviation.on': boolean;
  'markers.trendLineDeviation.passes': number;
  'markers.trendLineDeviation.cutoffFrequency': number;
  'markers.trendLineDeviation.thresholdMultiplier': number;
  'markers.trendLineDeviation.gapMinimumDuration': number;
  'markers.trendLineDeviation.gapMaximumDuration': number;
  'markers.trendLineDeviation.backwardGapPadding': number;
  'markers.trendLineDeviation.forwardGapPadding': number;

  'markers.temporallyIsolatedSamples.on': boolean;
  'markers.temporallyIsolatedSamples.sizeMaximum': number;
  'markers.temporallyIsolatedSamples.isolationMinimum': number;

  'resampling.on': boolean;
  'resampling.rate': number;
  'resampling.acceptableGap': number;
  'smoothing.on': boolean;
  'smoothing.cutoffFrequency': number;

  'validity.missing': number | undefined;
  'validity.correlation': number | undefined;
  'validity.difference': number | undefined;
}

interface IProps {
  title: string;
  selectedConfig: IConfig;
  action: (values: IConfigFormValues) => void;
}

const ConfigForm = (props: IProps) => {
  const { title, selectedConfig, action } = props;
  const initialValues: IConfigFormValues = flattenObject(selectedConfig);
  initialValues['measurement.baseline.param'] =
    selectedConfig.measurement.baseline.param.toString();
  initialValues['chart.showRejected'] = selectedConfig.chart.showRejected;
  initialValues['measurement.windows'] =
    (selectedConfig.measurement?.windows?.join('; ') as any) ?? '';

  const fields = [
    <TextItem
      key="name"
      name="name"
      label="Name"
      required
      reservedValues={['recommended', 'Just testing']}
    />,

    <Tabs type="card">
      <TabPane tab="General" key="1">
        <Collapse onChange={callback} key="collapse" accordion>
          <Panel header="File" key="11">
            <TextItem
              name="file.separator"
              label="Separator"
              required
              min={1}
              reservedValues={[]}
            />
            <TextItem
              name="file.timestamp"
              label="Timestamp"
              required
              reservedValues={[]}
            />
            <TextItem
              name="file.leftPupil"
              label="Left Pupil"
              required
              reservedValues={[]}
            />
            <TextItem
              name="file.rightPupil"
              label="Right Pupil"
              required
              reservedValues={[]}
            />
            <TextItem
              name="file.segmentActive"
              label="Segment Active"
              reservedValues={[]}
            />
          </Panel>
          <Panel header="Chart" key="12">
            <NumberItem
              name="chart.width"
              label="Width [px]"
              min={100}
              max={4000}
              step={50}
              required
            />
            <NumberItem
              name="chart.height"
              label="Height [px]"
              min={100}
              max={4000}
              step={50}
              required
            />
            <SwitchItem
              name="chart.showEyesPlot"
              label="Show Eye Plots"
              checkedLabel="On"
              uncheckedLabel="Off"
            />
            <SwitchItem
              name="chart.showMeanPlot"
              label="Show Mean Plot"
              checkedLabel="On"
              uncheckedLabel="Off"
            />
            <SwitchItem
              name="chart.showSmoothed"
              label="Show Smoothed Plot"
              checkedLabel="On"
              uncheckedLabel="Off"
            />
            <AntForm.Item
              label="Show rejected"
              name="chart.showRejected"
              rules={[]}
            >
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="Select to reject"
              >
                {[
                  <Option key="missing">missing</Option>,
                  <Option key="invalid">invalid</Option>,
                  <Option key="outliers">outliers</Option>,
                ]}
              </Select>
            </AntForm.Item>
          </Panel>
          <Panel header="Measurement" key="13">
            <SelectItem
              name="measurement.eye"
              label="Eye"
              values={['left', 'right', 'both']}
              required
            />
            <SelectItem
              name="measurement.baseline.type"
              label="Baseline"
              values={['from start', 'selected segment']}
              required
            />
            <TextItem
              name="measurement.baseline.param"
              label="Baseline Param"
              reservedValues={[]}
              required
              min={0}
            />
            <SelectItem
              name="measurement.segmentation"
              label="Segmentation"
              values={['scene', 'time windows']}
              required
            />
            <TextItem
              name="measurement.windows"
              label="Time windows"
              reservedValues={[]}
            />
          </Panel>
          <Panel header="Validity" key="14">
            <NumberItem
              name="validity.missing"
              label="Missing [%]"
              min={0}
              max={100}
              step={1}
            />
            <NumberItem
              name="validity.correlation"
              label="Correlation"
              min={-1}
              max={1}
              step={0.1}
            />
            <NumberItem
              name="validity.difference"
              label="Difference [mm]"
              min={0}
              max={10}
              step={1}
            />
          </Panel>
        </Collapse>
      </TabPane>
      <TabPane tab="Markers / Filters" key="2">
        <Collapse onChange={callback} key="collapse" accordion>
          <Panel header="Out of range" key="21">
            <NumberItem
              name="markers.outOfRange.min"
              label="Min [mm]"
              min={0}
              max={100}
              step={0.1}
              required
            />
            <NumberItem
              name="markers.outOfRange.max"
              label="Max [mm]"
              min={0}
              max={100}
              step={0.1}
              required
            />
          </Panel>
          <Panel header="Dilatation Speed" key="22">
            <SwitchItem
              name="markers.dilatationSpeed.on"
              label="Use"
              checkedLabel="On"
              uncheckedLabel="Off"
            />
            <NumberItem
              name="markers.dilatationSpeed.thresholdMultiplier"
              label="Threshold Multipler"
              min={0}
              max={1000}
              step={0.1}
              required
            />
            <NumberItem
              name="markers.dilatationSpeed.gapMinimumDuration"
              label="Gap minimum duration [ms]"
              min={0}
              max={5000}
              step={0.1}
            />
            <NumberItem
              name="markers.dilatationSpeed.gapMaximumDuration"
              label="Gap maximum duration [ms]"
              min={0}
              max={5000}
              step={0.1}
            />
            <NumberItem
              name="markers.dilatationSpeed.backwardGapPadding"
              label="Gap backward padding [ms]"
              min={0}
              max={5000}
              step={0.1}
            />
            <NumberItem
              name="markers.dilatationSpeed.forwardGapPadding"
              label="Gap forward padding [ms]"
              min={0}
              max={5000}
              step={0.1}
            />
          </Panel>
          <Panel header="Trendline Deviation" key="23">
            <SwitchItem
              name="markers.trendlineDeviation.on"
              label="Use"
              checkedLabel="On"
              uncheckedLabel="Off"
            />
            <NumberItem
              name="markers.trendlineDeviation.passes"
              label="Passes"
              min={1}
              max={100}
              step={1}
              required
            />
            <NumberItem
              name="markers.trendlineDeviation.cutoffFrequency"
              label="Cutoff frequency [Hz]"
              min={1}
              max={1000}
              step={1}
              required
            />
            <NumberItem
              name="markers.trendlineDeviation.thresholdMultiplier"
              label="Threshold Multipler"
              min={0}
              max={1000}
              step={0.1}
              required
            />
            <NumberItem
              name="markers.trendlineDeviation.gapMinimumDuration"
              label="Gap minimum duration [ms]"
              min={0}
              max={5000}
              step={0.1}
            />
            <NumberItem
              name="markers.trendlineDeviation.gapMaximumDuration"
              label="Gap maximum duration [ms]"
              min={0}
              max={5000}
              step={0.1}
            />
            <NumberItem
              name="markers.trendlineDeviation.backwardGapPadding"
              label="Gap backward padding [ms]"
              min={0}
              max={5000}
              step={0.1}
            />
            <NumberItem
              name="markers.trendlineDeviation.forwardGapPadding"
              label="Gap forward padding [ms]"
              min={0}
              max={5000}
              step={0.1}
            />
          </Panel>
          <Panel header="Temporally Isolated Samples" key="24">
            <SwitchItem
              name="markers.temporallyIsolatedSamples.on"
              label="Use"
              checkedLabel="On"
              uncheckedLabel="Off"
            />
            <NumberItem
              name="markers.temporallyIsolatedSamples.isolationMinimum"
              label="Min Isolation Gap [ms]"
              min={0}
              max={10000}
              step={1}
              required
            />
            <NumberItem
              name="markers.temporallyIsolatedSamples.sizeMaximum"
              label="Max Island Size [ms]"
              min={0}
              max={10000}
              step={1}
              required
            />
          </Panel>
        </Collapse>
      </TabPane>
      <TabPane tab="Estimation Improvement" key="3">
        <Collapse onChange={callback} key="collapse" accordion>
          <Panel header="Resampling" key="31">
            <SwitchItem
              name="resampling.on"
              label="Use"
              checkedLabel="On"
              uncheckedLabel="Off"
            />
            <NumberItem
              name="resampling.rate"
              label="Rate [Hz]"
              min={0}
              max={1000}
              step={1}
              required
            />
            <NumberItem
              name="resampling.acceptableGap"
              label="Acceptable Gap [ms]"
              min={0}
              max={1000000}
              step={1}
              required
            />
          </Panel>
          <Panel header="Smoothing" key="32">
            <SwitchItem
              name="smoothing.on"
              label="Use"
              checkedLabel="On"
              uncheckedLabel="Off"
            />
            <NumberItem
              name="smoothing.cutoffFrequency"
              label="Cuttoff Frequency [Hz]"
              min={0}
              max={1000}
              step={1}
              required
            />
          </Panel>
        </Collapse>
      </TabPane>
    </Tabs>,
  ];

  const onFinish = (values: IConfigFormValues) => {
    const update = { ...initialValues, ...values };
    update['chart.showRejected'] = values['chart.showRejected'];
    update['measurement.windows'] = (
      values['measurement.windows'] as any
    )?.split(';');

    console.log('INI', update);
    action(update);
  };

  return (
    <Form
      initialValues={initialValues}
      items={fields}
      onFinish={onFinish}
      title={title}
    />
  );
};

export default ConfigForm;
