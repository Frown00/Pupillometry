import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import StartingPage from './components/pages/Starting';
import { Routes } from './routes';
import Study from './components/pages/Study';
import NewStudy from './components/pages/form/NewStudy';
import NewGroup from './components/pages/form/NewGroup';
import Group from './components/pages/Group';
import Respondent from './components/pages/Respondent';
import About from './components/pages/About';
import Config from './components/pages/Config';
import Test from './components/pages/Test';
import AddRespondent from './components/pages/form/AddRespondent';
import Export from './components/pages/form/Export';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact path={Routes.Starting} component={StartingPage} />
        <Route exact path={Routes.Study()} component={Study} />
        <Route exact path={Routes.NewStudy} component={NewStudy} />
        <Route exact path={Routes.Group()} component={Group} />
        <Route exact path={Routes.NewGroup()} component={NewGroup} />
        <Route exact path={Routes.Respondent()} component={Respondent} />
        <Route exact path={Routes.AddRespondent()} component={AddRespondent} />
        <Route exact path={Routes.Export()} component={Export} />
        <Route path={Routes.Config} component={Config} />
        <Route path={Routes.Test} component={Test} />
        <Route path={Routes.About} component={About} />
      </Switch>
    </Router>
  );
}
