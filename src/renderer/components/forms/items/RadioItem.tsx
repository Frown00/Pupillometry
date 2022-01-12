import { Form, Radio } from 'antd';

const RadioItem = () => {
  return (
    <Form.Item
      name="radio-button"
      label="Eye"
      rules={[{ required: true, message: 'Please pick an item!' }]}
    >
      <Radio.Group>
        <Radio.Button value="left">Left</Radio.Button>
        <Radio.Button value="both">Both</Radio.Button>
        <Radio.Button value="right">Right</Radio.Button>
      </Radio.Group>
    </Form.Item>
  );
};

export default RadioItem;
