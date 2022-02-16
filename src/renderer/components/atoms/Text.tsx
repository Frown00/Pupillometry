import { Typography } from 'antd';
import { BaseType } from 'antd/lib/typography/Base';

interface IProps {
  type?: BaseType | undefined;
  children?: React.ReactNode;
  strong?: boolean;
}

export default function Text(props: IProps) {
  const { type, children, strong } = props;
  return (
    <Typography.Text type={type} strong={strong}>
      {children}
    </Typography.Text>
  );
}

Text.defaultProps = {
  type: undefined,
  children: undefined,
  strong: false,
};
