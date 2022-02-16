import { Collapse } from 'antd';
import { flattenObject } from '../../util/flattenObject';
import NumberItem from '../molecules/form/NumberItem';
import SelectItem from '../molecules/form/SelectItem';
import SwitchItem from '../molecules/form/SwitchItem';
import TextItem from '../molecules/form/TextItem';
import Form from './Form';

const { Panel } = Collapse;

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
  'processing.pupil.eye': 'left' | 'right' | 'both';
  'processing.pupil.mean': boolean;
  'processing.pupil.min': number;
  'processing.pupil.max': number;
  'processing.pupil.baseline': number;
  'processing.pupil.acceptableDifference': number;
  'processing.advancedFilters.dilatationSpeed.on': boolean;
  'processing.advancedFilters.dilatationSpeed.thresholdMultiplier': number;
  'processing.advancedFilters.trendLineDeviation.on': boolean;
  'processing.advancedFilters.trendLineDeviation.maxJump': number;
  'processing.advancedFilters.temporallyIsolatedSamples.on': boolean;
  'processing.advancedFilters.temporallyIsolatedSamples.range': number;
  'processing.advancedFilters.temporallyIsolatedSamples.gap': number;
  'processing.resampling.on': boolean;
  'processing.resampling.rate': number;
  'processing.interpolation.on': boolean;
  'processing.interpolation.acceptableGap': number;
  'processing.segmentDivision': boolean;
  'processing.timeWindow.on': boolean;
  'processing.timeWindow.windows': string;
  'validity.missing.general': number | undefined;
  'validity.missing.left': number | undefined;
  'validity.missing.right': number | undefined;
  'validity.correlation': number | undefined;
}

interface IProps {
  title: string;
  selectedConfig: IConfig;
  action: (values: IConfigFormValues) => void;
}

const ConfigForm = (props: IProps) => {
  const { title, selectedConfig, action } = props;
  const initialValues: IConfigFormValues = flattenObject(selectedConfig);
  const fields = [
    <TextItem
      key="name"
      name="name"
      label="Name"
      required
      reservedValues={['default']}
    />,
    <Collapse
      defaultActiveKey={['1']}
      onChange={callback}
      key="collapse"
      accordion
    >
      <Panel header="File" key="1">
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
      <Panel header="Chart" key="2">
        <NumberItem
          name="chart.width"
          label="Width [px]"
          min={100}
          max={2000}
          step={50}
          required
        />
        <NumberItem
          name="chart.height"
          label="Height [px]"
          min={100}
          max={2000}
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
      </Panel>
      <Panel header="Processing" key="3">
        <Collapse defaultActiveKey="1" accordion>
          <Panel header="Pupil" key="1">
            <SelectItem
              name="processing.pupil.eye"
              label="Eye"
              values={['left', 'right', 'both']}
            />
            <SwitchItem
              name="processing.pupil.mean"
              label="Include Mean"
              checkedLabel="On"
              uncheckedLabel="Off"
            />
            <NumberItem
              disabled
              name="processing.pupil.baseline"
              label="Baseline [mm]"
              min={0}
              max={100}
              step={0.1}
              required
            />
            <NumberItem
              name="processing.pupil.min"
              label="Min [mm]"
              min={0}
              max={100}
              step={0.1}
              required
            />
            <NumberItem
              name="processing.pupil.max"
              label="Max [mm]"
              min={0}
              max={100}
              step={0.1}
              required
            />
            <NumberItem
              name="processing.pupil.acceptableDifference"
              label="Acceptable Difference [mm]"
              min={0}
              max={100}
              step={0.1}
              required
            />
          </Panel>
          <Panel header="Advanced Filters" key="2">
            <Collapse defaultActiveKey="1" accordion>
              <Panel header="Dilatation Speed" key="1">
                <SwitchItem
                  name="processing.advancedFilters.dilatationSpeed.on"
                  label="Use"
                  checkedLabel="On"
                  uncheckedLabel="Off"
                />
                <NumberItem
                  name="processing.advancedFilters.dilatationSpeed.thresholdMultiplier"
                  label="Threshold Multipler"
                  min={0}
                  max={1000}
                  step={0.1}
                  required
                />
              </Panel>
              <Panel header="Trendline Deviation" key="2">
                <SwitchItem
                  name="processing.advancedFilters.trendLineDeviation.on"
                  label="Use"
                  checkedLabel="On"
                  uncheckedLabel="Off"
                />
                <NumberItem
                  name="processing.advancedFilters.trendLineDeviation.maxJump"
                  label="Max Jump [mm]"
                  min={0}
                  max={100}
                  step={0.1}
                  required
                />
              </Panel>
              <Panel header="Temporally Isolated Samples" key="3">
                <SwitchItem
                  name="processing.advancedFilters.temporallyIsolatedSamples.on"
                  label="Use"
                  checkedLabel="On"
                  uncheckedLabel="Off"
                />
                <NumberItem
                  name="processing.advancedFilters.temporallyIsolatedSamples.range"
                  label="Range [ms]"
                  min={0}
                  max={10000}
                  step={1}
                  required
                />
                <NumberItem
                  name="processing.advancedFilters.temporallyIsolatedSamples.gap"
                  label="Gap [ms]"
                  min={0}
                  max={10000}
                  step={1}
                  required
                />
              </Panel>
            </Collapse>
          </Panel>
          <Panel header="Other" key="3">
            <Collapse defaultActiveKey="1" accordion>
              <Panel header="Resampling" key="1">
                <SwitchItem
                  disabled
                  name="processing.resampling.on"
                  label="Use"
                  checkedLabel="On"
                  uncheckedLabel="Off"
                />
                <NumberItem
                  disabled
                  name="processing.resampling.rate"
                  label="Rate [Hz]"
                  min={1}
                  max={1000}
                  step={1}
                  required
                />
              </Panel>
              <Panel header="Interpolation" key="2">
                <SwitchItem
                  disabled
                  name="processing.interpolation.on"
                  label="Use"
                  checkedLabel="On"
                  uncheckedLabel="Off"
                />
                <NumberItem
                  disabled
                  name="processing.interpolation.acceptableGap"
                  label="Acceptable Gap [ms]"
                  min={0}
                  max={100000}
                  step={1}
                  required
                />
              </Panel>
              <Panel header="Segmentation" key="3">
                <SwitchItem
                  name="processing.segmentDivision"
                  label="Divide By Scene/Task"
                  checkedLabel="On"
                  uncheckedLabel="Off"
                />
                <SwitchItem
                  disabled
                  name="processing.timeWindow.on"
                  label="Use Time Windows"
                  checkedLabel="On"
                  uncheckedLabel="Off"
                />
                <TextItem
                  disabled
                  name="processing.timeWindow.windows"
                  label="Windows"
                  reservedValues={[]}
                  placeholder="[name, start, end] e.g. [W1, 0, 1000],[W2, 2000, 3000]"
                />
              </Panel>
            </Collapse>
          </Panel>
        </Collapse>
      </Panel>
      <Panel header="Validity" key="4">
        <NumberItem
          name="validity.correlation"
          label="Pupil Correlation (more than)"
          min={-1}
          max={1}
          step={0.1}
          required
        />
        <h4>
          <b>Missing (less than)</b>
        </h4>
        <NumberItem
          name="validity.missing.general"
          label="Both [%]"
          min={0}
          max={100}
          step={1}
          required
        />
        <NumberItem
          name="validity.missing.left"
          label="Left [%]"
          min={0}
          max={100}
          step={1}
          required
        />
        <NumberItem
          name="validity.missing.right"
          label="Right [%]"
          min={0}
          max={100}
          step={1}
          required
        />
      </Panel>
    </Collapse>,
  ];

  const onFinish = (values: IConfigFormValues) => {
    const update = { ...initialValues, ...values };
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
