/* eslint-disable no-return-assign */
import React from 'react';
import * as d3 from 'd3';
import ElectronWindow from '../../ElectronWindow';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IState {}

export default class Chart extends React.Component<IProps, IState> {
  ref!: SVGSVGElement;

  componentDidMount() {
    // activate
    const data = [];
    for (let i = 0; i < 10; i += 1) {
      data.push(Math.floor(Math.random() * 20) + 1);
    }
    this.buildGraph(data);
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
        <button
          type="button"
          onClick={ElectronWindow.get().api.ipcRenderer.loadData}
        >
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
