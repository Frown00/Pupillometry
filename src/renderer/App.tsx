/* eslint-disable no-return-assign */
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import React from 'react';
import * as d3 from 'd3';
import icon from '../../assets/icon.png';
import './App.css';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IState {}

class Hello extends React.Component<IProps, IState> {
  ref!: SVGSVGElement;

  componentDidMount() {
    // activate
    this.buildGraph([5, 10, 12]);
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
      .attr('transform', (d, i) => {
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
      <div className="svg">
        <svg
          className="container"
          ref={(ref: SVGSVGElement) => (this.ref = ref)}
          width="100"
          height="100"
        />
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
