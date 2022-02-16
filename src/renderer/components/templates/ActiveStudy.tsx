import { RouteComponentProps } from 'react-router';
import styled from 'styled-components';
import StudyNav from '../organisms/navbar/StudyNav';

const pjson = require('../../../../package.json');

class TitleBuilder {
  private title: string;

  private readonly separator = ' > ';

  constructor(title: string) {
    this.title = title;
  }

  addLevel(name: string | undefined) {
    if (!name) return this;
    this.title += this.separator + name;
    return this;
  }

  build() {
    return this.title;
  }
}

interface MatchParams {
  studyName: string;
  groupName?: string;
  respondentName?: string;
}

type MatchProps = RouteComponentProps<MatchParams>;

interface IProps {
  children: (JSX.Element | undefined)[] | JSX.Element;
  Loader?: JSX.Element | undefined;
  routerProps: MatchProps;
}

const Styled = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
`;

const Main = styled.main`
  margin-top: 50px;
  margin-left: 150px;
  margin-right: 100px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export default function ActiveStudy(props: IProps) {
  const { Loader, children, routerProps } = props;
  const title = pjson.build.productName;
  const { studyName, groupName, respondentName } = routerProps.match.params;

  document.title = new TitleBuilder(title)
    .addLevel(studyName)
    .addLevel(groupName)
    .addLevel(respondentName)
    .build();

  const main = Loader || children;
  return (
    <Styled>
      <StudyNav />
      <Main>{main}</Main>
    </Styled>
  );
}

ActiveStudy.defaultProps = {
  Loader: undefined,
};
