import styled from 'styled-components';
import Navbar from '../organisms/navbar/Navbar';

const pjson = require('../../../../package.json');

interface IProps {
  children: (JSX.Element | undefined)[] | JSX.Element;
  Loader?: JSX.Element | undefined;
}

const Main = styled.main`
  margin-top: 50px;
  margin-left: 150px;
  margin-right: 100px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Styled = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
`;

export default function General({ children, Loader = undefined }: IProps) {
  document.title = pjson.build.productName;
  const main = Loader || children;
  return (
    <Styled>
      <Navbar />
      <Main>{main}</Main>
    </Styled>
  );
}

General.defaultProps = {
  Loader: undefined,
};
