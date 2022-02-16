import { Form, Radio } from 'antd';

interface IProps {
  name: string;
  label: string;
  children: JSX.Element[];
  required?: boolean;
  disabled?: boolean;
}

const RadioGroup = (props: IProps) => {
  const { name, label, children, required, disabled } = props;
  return (
    <Form.Item
      name={name}
      label={label}
      rules={[{ required, message: 'Please pick an item!' }]}
    >
      <Radio.Group disabled={disabled}>{children}</Radio.Group>
    </Form.Item>
  );
};

RadioGroup.defaultProps = {
  required: false,
  disabled: false,
};

export default RadioGroup;
