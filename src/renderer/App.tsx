/* eslint-disable react/button-has-type */
/* eslint-disable no-return-assign */
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import StartingPage from './components/StartingPage';
import Study from './components/study/Study';
import Settings from './components/Settings';
import Nav from './components/Nav';
import Group from './components/group/Group';
import Respondent from './components/respondent/Respondent';
import Test from './components/playground/Test';
import CreateStudy from './components/forms/CreateStudy';
import CreateGroup from './components/forms/CreateGroup';
import AddRespondent from './components/forms/AddRespondent';

export default function App() {
  return (
    <div id="app">
      <Router>
        <Nav />
        <main>
          <Switch>
            <Route exact path="/" component={StartingPage} />
            <Route exact path="/study/:name" component={Study} />
            <Route exact path="/form/newStudy" component={CreateStudy} />
            <Route exact path="/study/:name/:groupName" component={Group} />
            <Route exact path="/form/newGroup" component={CreateGroup} />
            <Route
              exact
              path="/study/:name/:groupName/:respondentId"
              component={Respondent}
            />
            <Route exact path="/form/addRespondent" component={AddRespondent} />
            <Route path="/settings" component={Settings} />
            <Route path="/test" component={Test} />
          </Switch>
        </main>
      </Router>
    </div>
  );
}
