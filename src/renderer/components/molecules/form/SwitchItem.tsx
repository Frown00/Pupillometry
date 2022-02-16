import { Form, Switch } from 'antd';

interface IProps {
  name: string;
  label: string;
  checkedLabel?: string;
  uncheckedLabel?: string;
  disabled?: boolean;
}

const SwitchItem = (props: IProps) => {
  const { name, label, checkedLabel, uncheckedLabel, disabled } = props;
  return (
    <Form.Item name={name} label={label} valuePropName="checked" required>
      <Switch
        checkedChildren={checkedLabel}
        unCheckedChildren={uncheckedLabel}
        disabled={disabled}
      />
    </Form.Item>
  );
};

SwitchItem.defaultProps = {
  checkedLabel: 'On',
  uncheckedLabel: 'Off',
  disabled: false,
};

export default SwitchItem;
