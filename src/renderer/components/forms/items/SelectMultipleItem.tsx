import { Form, Select } from 'antd';

const { Option } = Select;

const SelectMultipleItem = () => {
  return (
    <Form.Item
      name="select-multiple"
      label="Group"
      rules={[
        {
          required: true,
          message: 'Please select your favourite colors!',
          type: 'array',
        },
      ]}
    >
      <Select mode="multiple" placeholder="Please select favourite colors">
        <Option value="red">Group 1</Option>
        <Option value="green">Group 2</Option>
        <Option value="blue">Group 3</Option>
      </Select>
    </Form.Item>
  );
};

export default SelectMultipleItem;
