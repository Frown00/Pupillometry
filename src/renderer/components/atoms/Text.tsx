import { Typography } from 'antd';
import { BaseType } from 'antd/lib/typography/Base';

interface IProps {
  type?: BaseType | undefined;
  children?: React.ReactNode;
  strong?: boolean;
  color?: string;
  size?: string;
}

export default function Text(props: IProps) {
  const { type, children, strong, color, size } = props;
  const style: any = {};
  if (color) style.color = color;
  if (size) style.fontSize = size;
  return (
    <Typography.Text style={style} type={type} strong={strong}>
      {children}
    </Typography.Text>
  );
}

Text.defaultProps = {
  type: undefined,
  children: undefined,
  strong: false,
  color: '#222',
  size: undefined,
};
