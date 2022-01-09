/* eslint-disable react/button-has-type */
/* eslint-disable no-return-assign */
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import { Button, DatePicker } from 'antd';
import StartingPage from './components/StartingPage';
import Study from './components/study/Study';
import Settings from './components/Settings';
import Nav from './components/Nav';
import Group from './components/group/Group';
import Respondent from './components/respondent/Respondent';
import CreateForm from './components/CreateForm';
import Playground from './components/playground/Playground';

export default function App() {
  return (
    <div id="app">
      <Router>
        <Nav />
        <main>
          <Switch>
            <Route exact path="/" component={StartingPage} />
            <Route exact path="/study/:name" component={Study} />
            <Route exact path="/form/newStudy" component={CreateForm} />
            <Route exact path="/study/:name/:groupName" component={Group} />
            <Route
              exact
              path="/study/:name/:groupName/:respondentId"
              component={Respondent}
            />
            <Route path="/settings" component={Settings} />
            <Route path="/playground" component={Playground} />
          </Switch>
        </main>
      </Router>
    </div>
  );
}
