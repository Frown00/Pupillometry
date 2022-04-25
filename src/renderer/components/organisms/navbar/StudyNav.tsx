import { useRecoilState } from 'recoil';
import styled from 'styled-components';
import {
  ExperimentOutlined,
  FolderOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import NavLink from '../../atoms/NavLink';
import { activeGroupState, activeStudyState } from '../../../assets/state';
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

const Subdivided = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  min-height: 100%;
`;

export default function StudyNav() {
  const [activeStudy] = useRecoilState(activeStudyState);
  const [activeGroup] = useRecoilState(activeGroupState);
  return (
    <Styled>
      <RouteLink to={Routes.Starting} Wrapper={Logo} />
      <Subdivided>
        <ul style={{ marginTop: '20px' }}>
          <NavLink
            to={Routes.Study(activeStudy?.name)}
            title={`Study: ${activeStudy?.name}`}
          >
            <FolderOutlined />
          </NavLink>
          {activeGroup?.name ? (
            <NavLink
              to={Routes.Group(activeStudy?.name, activeGroup?.name)}
              title={`Group: ${activeGroup?.name}`}
            >
              <TeamOutlined />
            </NavLink>
          ) : (
            ''
          )}
        </ul>
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
      </Subdivided>
    </Styled>
  );
}
