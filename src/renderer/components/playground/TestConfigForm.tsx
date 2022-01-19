/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
import { Form, Button, FormInstance, Switch } from 'antd';
import * as util from '../forms/util';
import TextItem from '../forms/items/TextItem';
import NumberItem from '../forms/items/NumberItem';
import SelectItem from '../forms/items/SelectItem';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

interface IProps {
  history?: any;
  config: IConfig;
  onChange: any;
}

const TestConfigForm = (props: IProps) => {
  const onFinish = (values: IConfigFormValues) => {
    console.log('Received values of form: ', values);
    const newConfig = util.mapFormValuesToConfig(values);
    props.onChange(newConfig);
  };

  const setFieldValue = (
    form: FormInstance,
    name: any,
    value: string | number | boolean
  ): void => {
    if (form && form.getFieldValue(name) !== undefined) {
      const allFields: any = form.getFieldsValue();
      allFields[name] = value;
      form.setFieldsValue(allFields);
    }
  };

  const [form] = Form.useForm();
  const { config } = props;
  const defaultValues: IConfig = {
    chart: {
      height: 600,
      width: 800,
      showEyesPlot: false,
      showMeanPlot: true,
    },
    file: {
      leftPupil: 'ET_PupilLeft',
      rightPupil: 'ET_PupilRight',
      segmentActive: 'Scene active',
      separator: ',',
      timestamp: 'Timestamp',
    },
    name: 'Preprocessing Config',
    processing: {
      extraFilters: {
        dilatationSpeed: {
          on: false,
          thresholdMultiplier: 3,
        },
        temporallyIsolatedSamples: {
          gap: 50,
          on: false,
          range: 30,
        },
        trendLineDeviation: {
          on: false,
          maxJump: 0.8,
        },
      },
      interpolation: {
        acceptableGap: 50,
        on: true,
      },
      pupil: {
        acceptableDifference: 0.7,
        baseline: 3,
        eye: 'both',
        max: 9,
        mean: true,
        min: 1.5,
      },
      resampling: {
        on: false,
        rate: 50,
      },
      segmentDivision: true,
      smoothing: {
        cutoffFrequency: 4,
        on: true,
      },
      timeWindow: {
        on: false,
        windows: [],
      },
      validityConditions: {
        missing: {
          general: 10,
          left: 100,
          right: 100,
        },
        correlation: 0.7,
      },
    },
  };
  setFieldValue(form, 'name', config?.name ?? defaultValues.name);
  setFieldValue(
    form,
    'separator',
    config.file?.separator ?? defaultValues.file.separator
  );
  setFieldValue(
    form,
    'timestamp',
    config.file?.timestamp ?? defaultValues.file.timestamp
  );
  setFieldValue(
    form,
    'leftPupil',
    config.file?.leftPupil ?? defaultValues.file.leftPupil
  );
  setFieldValue(
    form,
    'rightPupil',
    config.file?.rightPupil ?? defaultValues.file.rightPupil
  );
  setFieldValue(
    form,
    'segmentActive',
    config.file?.segmentActive ?? defaultValues.file.segmentActive
  );
  // Chart
  setFieldValue(
    form,
    'width',
    config.chart?.width ?? defaultValues.chart.width
  );
  setFieldValue(
    form,
    'height',
    config.chart?.height ?? defaultValues.chart.height
  );
  setFieldValue(
    form,
    'showEyesPlot',
    config.chart?.showEyesPlot ?? defaultValues.chart.showEyesPlot
  );
  setFieldValue(
    form,
    'showMeanPlot',
    config.chart?.showMeanPlot ?? defaultValues.chart.showMeanPlot
  );
  // Processing
  // PUPIL
  setFieldValue(
    form,
    'eye',
    config.processing?.pupil.eye ?? defaultValues.processing.pupil.eye
  );
  setFieldValue(
    form,
    'mean',
    config.processing?.pupil.mean ?? defaultValues.processing.pupil.mean
  );
  setFieldValue(
    form,
    'min',
    config.processing?.pupil.min ?? defaultValues.processing.pupil.min
  );
  setFieldValue(
    form,
    'max',
    config.processing?.pupil?.max ?? defaultValues.processing.pupil.max
  );
  setFieldValue(
    form,
    'baseline',
    config.processing?.pupil.baseline ?? defaultValues.processing.pupil.baseline
  );
  setFieldValue(
    form,
    'acceptableDifference',
    config.processing?.pupil.acceptableDifference ??
      defaultValues.processing.pupil.acceptableDifference
  );
  // FILTERS
  setFieldValue(
    form,
    'dilatationSpeed.on',
    config.processing?.extraFilters.dilatationSpeed.on ??
      defaultValues.processing?.extraFilters.dilatationSpeed.on
  );
  setFieldValue(
    form,
    'dilatationSpeed.thresholdMultipler',
    config.processing?.extraFilters.dilatationSpeed.thresholdMultiplier ??
      defaultValues.processing?.extraFilters.dilatationSpeed.thresholdMultiplier
  );
  setFieldValue(
    form,
    'trendLineDeviation.on',
    config.processing?.extraFilters.trendLineDeviation.on ??
      defaultValues.processing?.extraFilters.trendLineDeviation.on
  );
  setFieldValue(
    form,
    'trendLineDeviation.maxJump',
    config.processing?.extraFilters.trendLineDeviation.maxJump ??
      defaultValues.processing?.extraFilters.trendLineDeviation.maxJump
  );
  setFieldValue(
    form,
    'temporallyIsolatedSamples.on',
    config.processing?.extraFilters.temporallyIsolatedSamples.on ??
      defaultValues.processing?.extraFilters.temporallyIsolatedSamples.on
  );
  setFieldValue(
    form,
    'temporallyIsolatedSamples.range',
    config.processing?.extraFilters.temporallyIsolatedSamples.range ??
      defaultValues.processing?.extraFilters.temporallyIsolatedSamples.range
  );
  setFieldValue(
    form,
    'temporallyIsolatedSamples.gap',
    config.processing?.extraFilters.temporallyIsolatedSamples.gap ??
      defaultValues.processing?.extraFilters.temporallyIsolatedSamples.gap
  );
  // RESAMPLING
  setFieldValue(
    form,
    'resampling.on',
    config.processing?.resampling.on ?? defaultValues.processing?.resampling.on
  );
  setFieldValue(
    form,
    'resampling.rate',
    config.processing?.resampling.rate ??
      defaultValues.processing?.resampling.rate
  );
  // INTERPOLATION
  setFieldValue(
    form,
    'interpolation.on',
    config.processing?.interpolation.on ??
      defaultValues.processing?.interpolation.on
  );
  setFieldValue(
    form,
    'interpolation.acceptableGap',
    config.processing?.interpolation.acceptableGap ??
      defaultValues.processing?.interpolation.acceptableGap
  );
  // SEGMENTATION
  setFieldValue(
    form,
    'segmentDivision',
    config.processing?.segmentDivision ??
      defaultValues.processing?.segmentDivision
  );
  setFieldValue(
    form,
    'timeWindow',
    config.processing?.timeWindow.on ?? defaultValues.processing?.timeWindow.on
  );
  setFieldValue(
    form,
    'windows',
    config.processing?.timeWindow.windows.toString() ??
      defaultValues.processing?.timeWindow.windows.toString()
  );
  // VALIDITY
  setFieldValue(
    form,
    'validity.correlation',
    config.processing?.validityConditions?.correlation ??
      defaultValues.processing?.validityConditions.correlation ??
      -1
  );
  setFieldValue(
    form,
    'validity.missing.general',
    config.processing?.validityConditions?.missing?.general ??
      defaultValues.processing?.validityConditions?.missing?.general ??
      100
  );
  setFieldValue(
    form,
    'validity.missing.left',
    config.processing?.validityConditions?.missing?.left ??
      defaultValues.processing?.validityConditions?.missing?.left ??
      100
  );
  setFieldValue(
    form,
    'validity.missing.right',
    config.processing?.validityConditions?.missing?.right ??
      defaultValues.processing?.validityConditions?.missing?.right ??
      100
  );
  return (
    <>
      <Form
        form={form}
        name="validate_other"
        {...formItemLayout}
        onFinish={onFinish}
        initialValues={{
          name: defaultValues.name,
          separator: defaultValues.file.separator,
          timestamp: defaultValues.file.timestamp,
          leftPupil: defaultValues.file.leftPupil,
          rightPupil: defaultValues.file.rightPupil,
          segmentActive: defaultValues.file.segmentActive,
          width: defaultValues.chart.width,
          height: defaultValues.chart.height,
          showEyesPlot: defaultValues.chart.showEyesPlot,
          showMeanPlot: defaultValues.chart.showMeanPlot,
          eye: defaultValues.processing.pupil.eye,
          mean: defaultValues.processing.pupil.mean,
          min: defaultValues.processing.pupil.min,
          max: defaultValues.processing.pupil.max,
          baseline: defaultValues.processing.pupil.baseline,
          acceptableDifference:
            defaultValues.processing.pupil.acceptableDifference,
          'dilatationSpeed.on':
            defaultValues.processing.extraFilters.dilatationSpeed.on,
          'dilatationSpeed.thresholdMultiplier':
            defaultValues.processing.extraFilters.dilatationSpeed
              .thresholdMultiplier,
          'trendLineDeviation.on':
            defaultValues.processing.extraFilters.trendLineDeviation.on,
          'trendLineDeviation.maxJump':
            defaultValues.processing.extraFilters.trendLineDeviation.maxJump,
          'temporallyIsolatedSamples.on':
            defaultValues.processing.extraFilters.temporallyIsolatedSamples.on,
          'temporallyIsolatedSamples.range':
            defaultValues.processing.extraFilters.temporallyIsolatedSamples
              .range,
          'temporallyIsolatedSamples.gap':
            defaultValues.processing.extraFilters.temporallyIsolatedSamples.gap,
          'resampling.on': defaultValues.processing.resampling.on,
          'resampling.rate': defaultValues.processing.resampling.rate,
          'interpolation.on': defaultValues.processing.interpolation.on,
          'interpolation.acceptableGap':
            defaultValues.processing.interpolation.acceptableGap,
          segmentDivision: defaultValues.processing.segmentDivision,
          timeWindow: defaultValues.processing.timeWindow.on,
          windows: '',
          'validity.missing.general':
            defaultValues.processing.validityConditions.missing?.general,
          'validity.missing.left':
            defaultValues.processing.validityConditions.missing?.left,
          'validity.missing.right':
            defaultValues.processing.validityConditions.missing?.right,
          'validity.correlation':
            defaultValues.processing.validityConditions.correlation,
        }}
      >
        <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
          <h1>Create Study</h1>
        </Form.Item>
        <Form.Item wrapperCol={{ span: 2, offset: 2 }} style={{ margin: 0 }}>
          <span>
            <h3>
              <b>File</b>
            </h3>
          </span>
        </Form.Item>
        <TextItem
          name="separator"
          label="Separator"
          required
          min={1}
          reservedValues={[]}
        />
        <TextItem
          name="timestamp"
          label="Timestamp"
          required
          reservedValues={[]}
        />
        <TextItem
          name="leftPupil"
          label="Left Pupil"
          required
          reservedValues={[]}
        />
        <TextItem
          name="rightPupil"
          label="Right Pupil"
          required
          reservedValues={[]}
        />
        <TextItem
          name="segmentActive"
          label="Segment Active"
          reservedValues={[]}
        />
        <Form.Item wrapperCol={{ span: 2, offset: 2 }} style={{ margin: 0 }}>
          <span>
            <h3>
              <b>Chart</b>
            </h3>
          </span>
        </Form.Item>
        <NumberItem
          name="width"
          label="Width [px]"
          min={100}
          max={2000}
          step={50}
          required
        />
        <NumberItem
          name="height"
          label="Height [px]"
          min={100}
          max={2000}
          step={50}
          required
        />
        <Form.Item
          name="showEyesPlot"
          label="Show Eye Plots"
          valuePropName="checked"
        >
          <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <Form.Item
          name="showMeanPlot"
          label="Show Mean Plot"
          valuePropName="checked"
        >
          <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 2, offset: 2 }} style={{ margin: 0 }}>
          <h3>
            <b>Preprocessing</b>
          </h3>
        </Form.Item>
        <Form.Item wrapperCol={{ span: 2, offset: 3 }} style={{ margin: 0 }}>
          <h4>
            <b>Pupil</b>
          </h4>
        </Form.Item>
        <SelectItem name="eye" label="Eye" values={['left', 'right', 'both']} />
        <Form.Item name="mean" label="Include Mean" valuePropName="checked">
          <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <NumberItem
          name="baseline"
          label="Baseline [mm]"
          min={0}
          max={100}
          step={0.1}
          required
        />
        <NumberItem
          name="min"
          label="Min [mm]"
          min={0}
          max={100}
          step={0.1}
          required
        />
        <NumberItem
          name="max"
          label="Max [mm]"
          min={0}
          max={100}
          step={0.1}
          required
        />
        <NumberItem
          name="acceptableDifference"
          label="Acceptable Difference [mm]"
          min={0}
          max={100}
          step={0.1}
          required
        />
        <Form.Item wrapperCol={{ span: 2, offset: 3 }} style={{ margin: 0 }}>
          <h4>
            <b>Filters</b>
          </h4>
        </Form.Item>
        <Form.Item wrapperCol={{ span: 5, offset: 4 }} style={{ margin: 0 }}>
          <h5>
            <b>Dilatation Speed</b>
          </h5>
        </Form.Item>
        <Form.Item
          name="dilatationSpeed.on"
          label="Use"
          valuePropName="checked"
        >
          <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <NumberItem
          name="dilatationSpeed.thresholdMultiplier"
          label="Threshold Multipler"
          min={0}
          max={1000}
          step={0.1}
          required
        />
        <Form.Item wrapperCol={{ span: 5, offset: 4 }} style={{ margin: 0 }}>
          <h5>
            <b>Trendline Devation</b>
          </h5>
        </Form.Item>
        <Form.Item
          name="trendLineDeviation.on"
          label="Use"
          valuePropName="checked"
        >
          <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <NumberItem
          name="trendLineDeviation.maxJump"
          label="Max Jump [mm]"
          min={0}
          max={100}
          step={0.1}
          required
        />
        <Form.Item wrapperCol={{ span: 10, offset: 4 }} style={{ margin: 0 }}>
          <h5>
            <b>Temporally Isolated Samples</b>
          </h5>
        </Form.Item>
        <Form.Item
          name="temporallyIsolatedSamples.on"
          label="Use"
          valuePropName="checked"
        >
          <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <NumberItem
          name="temporallyIsolatedSamples.range"
          label="Range [ms]"
          min={0}
          max={10000}
          step={1}
          required
        />
        <NumberItem
          name="temporallyIsolatedSamples.gap"
          label="Gap [ms]"
          min={0}
          max={10000}
          step={1}
          required
        />
        <Form.Item wrapperCol={{ span: 2, offset: 3 }} style={{ margin: 0 }}>
          <h4>
            <b>Resampling</b>
          </h4>
        </Form.Item>
        <Form.Item name="resampling.on" label="Use" valuePropName="checked">
          <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <NumberItem
          name="resampling.rate"
          label="Rate [Hz]"
          min={1}
          max={1000}
          step={1}
          required
        />
        <Form.Item wrapperCol={{ span: 2, offset: 3 }} style={{ margin: 0 }}>
          <h4>
            <b>Interpolation</b>
          </h4>
        </Form.Item>
        <Form.Item name="interpolation.on" label="Use" valuePropName="checked">
          <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <NumberItem
          name="interpolation.acceptableGap"
          label="Acceptable Gap [ms]"
          min={0}
          max={100000}
          step={1}
          required
        />
        <Form.Item wrapperCol={{ span: 2, offset: 2 }} style={{ margin: 0 }}>
          <h3>
            <b>Segmentation</b>
          </h3>
        </Form.Item>
        <Form.Item
          name="segmentDivision"
          label="Breakdown by task"
          valuePropName="checked"
        >
          <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <Form.Item
          name="timeWindow"
          label="Time windows"
          valuePropName="checked"
        >
          <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <TextItem
          name="windows"
          label="Windows"
          reservedValues={[]}
          placeholder="[name, start, end] e.g. [W1, 0, 1000],[W2, 2000, 3000]"
        />
        <Form.Item wrapperCol={{ span: 7, offset: 2 }} style={{ margin: 0 }}>
          <h3>
            <b>Conditions of Validiy</b>
          </h3>
        </Form.Item>
        <NumberItem
          name="validity.correlation"
          label="Pupil Correlation (more than)"
          min={-1}
          max={1}
          step={0.1}
          required
        />
        <Form.Item wrapperCol={{ span: 7, offset: 3 }} style={{ margin: 0 }}>
          <h4>
            <b>Missing (less than)</b>
          </h4>
        </Form.Item>
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
        <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default TestConfigForm;
