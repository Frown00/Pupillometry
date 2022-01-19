/* eslint-disable react/require-default-props */
import { Form, InputNumber } from 'antd';

interface IProps {
  min: number;
  max: number;
  step?: number;
  label: string;
  name: string;
  required?: boolean;
}

const NumberItem = ({ name, label, min, max, step, required }: IProps) => {
  return (
    <Form.Item label={label} name={name} required={required}>
      <InputNumber min={min} max={max} step={step ?? 1} />
    </Form.Item>
  );
};

export default NumberItem;
