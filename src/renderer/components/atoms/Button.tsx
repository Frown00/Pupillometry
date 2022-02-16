import { Button as AntdButton } from 'antd';

interface IProps {
  type?:
    | 'default'
    | 'link'
    | 'text'
    | 'ghost'
    | 'primary'
    | 'dashed'
    | undefined;
  onClick?: React.MouseEventHandler<HTMLElement> | undefined;
  children?: React.ReactNode | undefined;
}

export default function Button(props: IProps) {
  const { type, onClick, children } = props;
  return (
    <AntdButton type={type} onClick={onClick}>
      {children}
    </AntdButton>
  );
}

Button.defaultProps = {
  type: 'default',
  onClick: undefined,
  children: undefined,
};
