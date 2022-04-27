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
  htmlType?: 'button' | 'submit' | 'reset' | undefined;
  block?: boolean;
  danger?: boolean;
}

export default function Button(props: IProps) {
  const { type, onClick, children, htmlType, block, danger } = props;
  return (
    <AntdButton
      type={type}
      onClick={onClick}
      htmlType={htmlType}
      block={block}
      danger={danger}
    >
      {children}
    </AntdButton>
  );
}

Button.defaultProps = {
  type: 'default',
  onClick: undefined,
  children: undefined,
  htmlType: 'button',
  block: false,
  danger: false,
};
