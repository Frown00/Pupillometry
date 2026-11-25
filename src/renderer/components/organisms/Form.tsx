/* eslint-disable react/jsx-props-no-spreading */
import { Form as AntdForm, Button } from 'antd';
import { useEffect } from 'react';
import Title from '../atoms/Title';

type RecursivePartial<T> = T extends object
  ? {
      [P in keyof T]?: T[P] extends (infer U)[]
        ? RecursivePartial<U>[]
        : T[P] extends object
        ? RecursivePartial<T[P]>
        : T[P];
    }
  : T;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

interface IProps<T extends object> {
  title: string;
  onFinish: (values: T) => void;
  initialValues: RecursivePartial<T>;
  items: JSX.Element[];
  isLoading?: boolean;
}

const Form = <T extends object>(props: IProps<T>) => {
  const { onFinish, items, initialValues, title, isLoading = false } = props;
  const [form] = AntdForm.useForm<T>();
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  return (
    <>
      <AntdForm<T>
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
        <AntdForm.Item wrapperCol={{ span: 14, offset: 6 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            style={{ width: '100%', marginTop: '30px' }}
          >
            Submit
          </Button>
        </AntdForm.Item>
      </AntdForm>
    </>
  );
};

Form.defaultProps = {
  isLoading: false,
};

export default Form;
