import { NavLink as RouterNavLink } from 'react-router-dom';
import styled from 'styled-components';
import color from '../../assets/color';

const StyledNavLink = styled(RouterNavLink)`
  color: ${color.font.light};
  margin: 10px;
  padding: 10px;
  font-size: 24px;
  display: block;
  &:hover {
    color: ${color.accent.primary};
  }
  &.active {
    color: ${color.accent.primary};
  }
`;

interface IProps {
  children: JSX.Element;
  title: string;
  to: string;
}

export default function NavLink(props: IProps) {
  const { children, title, to } = props;
  return (
    <StyledNavLink exact to={to} title={title}>
      {children}
    </StyledNavLink>
  );
}
