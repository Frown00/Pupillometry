/* eslint-disable react/jsx-props-no-spreading */
import { Form as AntdForm, Button } from 'antd';
import { useEffect } from 'react';
import Title from '../atoms/Title';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

interface IProps {
  title: string;
  onFinish: (values: any) => void;
  initialValues: any;
  items: JSX.Element[];
}

const Form = (props: IProps) => {
  const { onFinish, items, initialValues, title } = props;
  const [form] = AntdForm.useForm();
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);
  return (
    <>
      <AntdForm
        form={form}
        name="validate_other"
        {...formItemLayout}
        onFinish={onFinish}
        initialValues={{
          ...initialValues,
        }}
      >
        <AntdForm.Item wrapperCol={{ span: 12, offset: 6 }}>
          <Title level={1}>{title}</Title>
        </AntdForm.Item>
        {items}
        <AntdForm.Item wrapperCol={{ span: 12, offset: 6 }}>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Submit
          </Button>
        </AntdForm.Item>
      </AntdForm>
    </>
  );
};

export default Form;
