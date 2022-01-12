import { Form, InputNumber } from 'antd';

const NumberItem = () => {
  return (
    <Form.Item label="InputNumber">
      <Form.Item name="input-number" noStyle>
        <InputNumber min={0.1} max={10} step={0.1} />
      </Form.Item>
      <span className="ant-form-text"> machines</span>
    </Form.Item>
  );
};

export default NumberItem;
