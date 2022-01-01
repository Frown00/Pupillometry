import React from 'react';
import { Link } from 'react-router-dom';

const pjson = require('../../../package.json');

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IState {}

export default class StartingPage extends React.Component<IProps, IState> {
  // ref!: SVGSVGElement;

  componentDidMount() {
    // activate
    // this.buildGraph([5, 10, 12]);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
  }

  render() {
    document.title = pjson.build.productName;
    return (
      <div>
        <Link to="/form/newStudy">
          <button type="button">New Study</button>
        </Link>
        <br />
        <br />
        <div>
          <h2>Recent</h2>
          <ul>
            <Link to="/study/Study 1">
              <li className="link-page">Study 1</li>
            </Link>
          </ul>
        </div>
        <br />
        <br />
        <div>
          <h2>All studies</h2>
          <ul>
            <Link to="/study/Study 1">
              <li className="link-page">Study 1</li>
            </Link>
            <Link to="/study/Study 2">
              <li className="link-page">Study 2</li>
            </Link>
            <Link to="/study/Study 3">
              <li className="link-page">Study 3</li>
            </Link>
          </ul>
        </div>
      </div>
    );
  }
}
