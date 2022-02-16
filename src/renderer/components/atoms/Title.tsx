import { Typography } from 'antd';

interface IProps {
  level?: 5 | 1 | 2 | 3 | 4 | undefined;
  children?: React.ReactNode | undefined;
}

export default function Title(props: IProps) {
  const { level, children } = props;
  return <Typography.Title level={level}>{children}</Typography.Title>;
}

Title.defaultProps = {
  level: 1,
  children: undefined,
};
