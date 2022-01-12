/* eslint-disable react/require-default-props */
import { Form, Input } from 'antd';

interface IProps {
  name: string;
  label: string;
  required?: boolean;
  reservedValues: string[];
}

const TextItem = (props: IProps) => {
  const { name, label, required } = props;
  return (
    <Form.Item
      name={name}
      label={label}
      rules={[
        { required, message: 'Name is required!' },
        { min: 3, message: 'Required more than 3 characters!' },
        { max: 200, message: 'Required less than 200 characters!' },
        ({ getFieldValue }) => ({
          validator(_, value) {
            const unique = !props.reservedValues.includes(value.trim());
            if (unique) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('Name is not unique!'));
          },
        }),
      ]}
    >
      <Input />
    </Form.Item>
  );
};

export default TextItem;
