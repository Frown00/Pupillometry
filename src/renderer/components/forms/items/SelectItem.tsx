/* eslint-disable react/require-default-props */
import { Form, Select } from 'antd';

const { Option } = Select;

interface IProps {
  name: string;
  label: string;
  required?: boolean;
}

const SelectItem = (props: IProps) => {
  const { name, label, required } = props;
  return (
    <Form.Item
      name={name}
      label={label}
      hasFeedback
      rules={[{ required, message: 'Select something!' }]}
    >
      <Select placeholder="Please select a config">
        <Option value="default-config">Default</Option>
        <Option value="config-1">Config 1</Option>
        <Option value="config-2">Config 2</Option>
      </Select>
    </Form.Item>
  );
};

export default SelectItem;
