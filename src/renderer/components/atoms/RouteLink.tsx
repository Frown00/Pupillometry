import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface IProps {
  to: string;
  label?: string;
  Wrapper: ComponentType<{ children?: ReactNode }>;
}

export default function RouteLink({ to, label, Wrapper }: IProps) {
  const wrappedLabel = <Wrapper>{label}</Wrapper>;

  return <Link to={to}>{wrappedLabel}</Link>;
}

RouteLink.defaultProps = {
  label: '',
};
