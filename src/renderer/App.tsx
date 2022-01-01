/* eslint-disable react/button-has-type */
/* eslint-disable no-return-assign */
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
// import icon from '../../assets/icon.png';
import './App.css';
import StartingPage from './components/StartingPage';
import Study from './components/study/Study';
import Settings from './components/Settings';
import Nav from './components/Nav';
import Group from './components/study/group/Group';
import Participant from './components/study/group/participant/Participant';
import CreateForm from './components/CreateForm';

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
              path="/study/:name/:groupName/:participantId"
              component={Participant}
            />
            <Route path="/settings" component={Settings} />
          </Switch>
        </main>
      </Router>
    </div>
  );
}
