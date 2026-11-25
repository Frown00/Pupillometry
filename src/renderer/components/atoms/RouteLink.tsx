import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface IProps {
  to: string;
  label?: string;
  Wrapper: ComponentType<{ children?: ReactNode }>;
}

export default function RouteLink({ to, label, Wrapper }: IProps) {
  const wrappedLabel = (
    // @ts-expect-error -- Router and wrapper React types are incompatible.
    <Wrapper>{label}</Wrapper>
  );

  return (
    // @ts-expect-error -- Router and wrapper React types are incompatible.
    <Link to={to}>{wrappedLabel}</Link>
  );
}

RouteLink.defaultProps = {
  label: '',
};
