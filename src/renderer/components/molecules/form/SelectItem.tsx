/* eslint-disable react/require-default-props */
import { Form, Select } from 'antd';
import { SelectValue } from 'antd/lib/select';

const { Option } = Select;

interface IProps {
  name: string;
  label: string;
  required?: boolean;
  values: string[];
  onChange?: (value: SelectValue) => void;
}

const SelectItem = (props: IProps) => {
  const { name, label, values, required, onChange } = props;
  const options = values.map((v) => (
    <Option key={v} value={v}>
      {v}
    </Option>
  ));
  return (
    <Form.Item
      name={name}
      label={label}
      hasFeedback
      rules={[{ required, message: 'Select something!' }]}
    >
      <Select placeholder="Please select a config" onChange={onChange}>
        {options}
      </Select>
    </Form.Item>
  );
};

export default SelectItem;
