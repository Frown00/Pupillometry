import styled from 'styled-components';
import color from '../../assets/color';
import RouteLink from '../atoms/RouteLink';

interface IProps {
  to: string;
  label: string;
}

const Styled = styled.div`
  color: ${color.font.dark};
  margin: 20px 30px 0px 0px;
  padding: 20px;
  border: 1px solid black;
`;

export default function BlockLink(props: IProps) {
  const { to, label } = props;
  return <RouteLink to={to} label={label} Wrapper={Styled} />;
}
