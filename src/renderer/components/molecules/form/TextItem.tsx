/* eslint-disable react/require-default-props */
import { Form, Input } from 'antd';

interface IProps {
  name: string;
  label: string;
  required?: boolean;
  reservedValues: string[];
  placeholder?: string;
  min?: number;
  disabled?: boolean;
}

const TextItem = (props: IProps) => {
  const { name, label, required, placeholder, min, disabled, reservedValues } =
    props;

  return (
    <Form.Item
      name={name}
      label={label}
      rules={[
        { required, message: 'Name is required!' },
        {
          min: min === undefined ? 2 : min,
          message: 'Required more than 2 characters!',
        },
        { max: 200, message: 'Required less than 200 characters!' },
        ({ getFieldValue }) => ({
          validator(_, value) {
            const unique = !reservedValues.includes(value?.trim());
            if (unique) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('Name is not unique!'));
          },
        }),
      ]}
    >
      <Input disabled={disabled} placeholder={placeholder} />
    </Form.Item>
  );
};

export default TextItem;
