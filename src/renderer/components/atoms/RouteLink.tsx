import { Link } from 'react-router-dom';

interface IProps {
  to: string;
  label?: string;
  Wrapper: JSX.Element | any;
}

export default function RouteLink({ to, label, Wrapper }: IProps) {
  return (
    <Link to={to}>
      <Wrapper>{label}</Wrapper>
    </Link>
  );
}

RouteLink.defaultProps = {
  label: '',
};
