import {
  ExperimentOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import NavLink from '../../atoms/NavLink';
import color from '../../../assets/color';
import { Routes } from '../../../routes';
import RouteLink from '../../atoms/RouteLink';
import Logo from '../../molecules/Logo';

const Styled = styled.nav`
  position: fixed;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  background-color: ${color.core.primary};
  color: ${color.font.light};
  flex-grow: 1;
  z-index: 999;
`;

export default function Navbar() {
  return (
    <Styled>
      <RouteLink to={Routes.Starting} Wrapper={Logo} />
      <ul>
        <NavLink to={Routes.Test} title="Test">
          <ExperimentOutlined />
        </NavLink>
        <NavLink to={Routes.About} title="About">
          <InfoCircleOutlined />
        </NavLink>
        <NavLink to={Routes.Config} title="Configuration">
          <SettingOutlined />
        </NavLink>
      </ul>
    </Styled>
  );
}
