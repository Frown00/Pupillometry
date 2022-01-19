/* eslint-disable react/button-has-type */
/* eslint-disable no-return-assign */
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import StartingPage from './components/StartingPage';
import Study from './components/study/Study';
import Config from './components/Config';
import Nav from './components/Nav';
import Group from './components/group/Group';
import Respondent from './components/respondent/Respondent';
import Test from './components/playground/Test';
import CreateStudy from './components/forms/CreateStudy';
import CreateGroup from './components/forms/CreateGroup';
import AddRespondent from './components/forms/AddRespondent';
import StudyNav from './components/StudyNav';
import About from './components/About';

export default function App() {
  return (
    <div id="app">
      <Router>
        <Switch>
          <Route exact path="/" component={Nav} />
          <Route exact path="/test" component={Nav} />
          <Route exact path="/config" component={Nav} />
          <Route exact path="/about" component={Nav} />
          <Route path="/study" component={StudyNav} />
          <Route exact path="/form/newStudy" component={Nav} />
          <Route path="/form" component={StudyNav} />
        </Switch>
        <main>
          <Switch>
            <Route exact path="/" component={StartingPage} />
            <Route exact path="/study/:name" component={Study} />
            <Route exact path="/form/newStudy" component={CreateStudy} />
            <Route exact path="/study/:name/:groupName" component={Group} />
            <Route exact path="/form/:name/newGroup" component={CreateGroup} />
            <Route
              exact
              path="/study/:name/:groupName/:respondentName"
              component={Respondent}
            />
            <Route
              exact
              path="/form/:name/:groupName/addRespondent"
              component={AddRespondent}
            />
            <Route path="/config" component={Config} />
            <Route path="/test" component={Test} />
            <Route path="/about" component={About} />
          </Switch>
        </main>
      </Router>
    </div>
  );
}
