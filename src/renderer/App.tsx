/* eslint-disable react/button-has-type */
/* eslint-disable no-return-assign */
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import React from 'react';
import * as d3 from 'd3';
// import icon from '../../assets/icon.png';
import './App.css';
import ElectronWindow from './ElectronWindow';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IState {}
// const customWindow: CustomWindow = window;
const electronWindow = ElectronWindow.get();

class Hello extends React.Component<IProps, IState> {
  ref!: SVGSVGElement;

  componentDidMount() {
    // activate
    this.buildGraph([5, 10, 12]);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    electronWindow.api.ipcRenderer.on('get-data', (data: any) => {
      console.log(data.length);
    });
  }

  private buildGraph(data: Array<number>) {
    const width = 200;
    const scaleFactor = 10;
    const barHeight = 20;

    const graph = d3
      .select(this.ref)
      .attr('width', width)
      .attr('height', barHeight * data.length);

    const bar = graph
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (_d, i) => {
        return `translate(0,${i * barHeight})`;
      });

    bar
      .append('rect')
      .attr('width', (d) => {
        return d * scaleFactor;
      })
      .attr('height', barHeight - 1);

    bar
      .append('text')
      .attr('x', (d) => {
        return d * scaleFactor;
      })
      .attr('y', barHeight / 2)
      .attr('dy', '.35em')
      .text((d) => {
        return d;
      });
  }

  render() {
    return (
      <div>
        <button onClick={electronWindow.api.ipcRenderer.loadData}>
          Load Data
        </button>
        <div className="svg">
          <svg
            className="container"
            ref={(ref: SVGSVGElement) => (this.ref = ref)}
            width="100"
            height="100"
          />
        </div>
      </div>
    );
  }
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
