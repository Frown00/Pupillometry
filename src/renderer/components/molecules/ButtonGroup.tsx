import styled from 'styled-components';

interface IProps {
  children?: React.ReactNode | undefined;
}

const Group = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

export default function ButtonGroup(props: IProps) {
  const { children } = props;
  return <Group>{children}</Group>;
}

ButtonGroup.defaultProps = {
  children: undefined,
};
