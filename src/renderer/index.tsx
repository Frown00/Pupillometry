import { render } from 'react-dom';
import { RecoilRoot } from 'recoil';
import App from './App';

render(
  <RecoilRoot>
    <App />
  </RecoilRoot>,
  document.getElementById('root')
);
