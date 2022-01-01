/* eslint-disable react/no-unused-state */
/* eslint-disable react/state-in-constructor */
/* eslint-disable no-return-assign */
import React from 'react';
import * as d3 from 'd3';
import ElectronWindow from '../../ElectronWindow';
import { Channel } from '../../../ipc/channels';
import DefaultLoader from '../Loader';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}
const { ipcRenderer } = ElectronWindow.get().api;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IState {
  data: any[];
  rows: number;
  isLoading: boolean;
}

interface IEyeTracker {
  Timestamp: number;
  ET_PupilLeft: number;
  ET_PupilRight: number;
}

const ColorPallette = {
  okabe: {
    orangeSolid: 'rgba(230, 159, 0, 1)',
    orange80: 'rgba(230, 159, 0, 0.8)',
    orange30: 'rgba(230, 159, 0, 0.3)',
    cyanSolid: 'rgba(86, 180, 233, 1)',
    cyan80: 'rgba(86, 180, 233, 0.8)',
    cyan30: 'rgba(86, 180, 233, 0.3)',
  },
};

export default class Chart extends React.Component<IProps, IState> {
  ref!: SVGSVGElement;

  state = {
    data: [1, 2, 3, 4, 5],
    rows: 0,
    isLoading: false,
  };

  componentDidMount() {
    // activate
    ipcRenderer.on(Channel.getData, (pupilData: unknown[]) => {
      const rows = pupilData.length;
      this.buildGraph(pupilData);
      this.setState({ rows });
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(Channel.getData);
    d3.select(this.ref).remove();
  }

  private buildGraph(data: any[]) {
    const dataset = data;
    // #region Accessors
    const xAccessor = (d: IEyeTracker) => d.Timestamp;
    const yAccessorLeft = (d: IEyeTracker) => {
      if (d.ET_PupilLeft > 1.5 && d.ET_PupilLeft < 9) return d.ET_PupilLeft;
      return -1;
    };
    const yAccessorRight = (d: IEyeTracker) => {
      if (d.ET_PupilRight > 1.5 && d.ET_PupilRight < 9) return d.ET_PupilRight;
      return -1;
    };
    // #endregion
    // #region  Dimensions
    const dimensions = {
      width: 1200,
      height: 500,
      margin: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
      ctrWidth: 0,
      ctrHeight: 0,
    };
    dimensions.ctrWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.ctrHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
    // #endregion
    // #region Creating SVG
    const svg = d3
      .select(this.ref)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const container = svg
      .raise()
      .append('g')
      .attr(
        'transform',
        `translate(${dimensions.margin.left}, ${dimensions.margin.top})`
      );
    // #endregion
    // #region  Scales
    const xScale = d3
      .scaleLinear()
      .domain([dataset[0].Timestamp, d3.max(dataset, xAccessor)])
      .rangeRound([0, dimensions.ctrWidth])
      .clamp(true);

    const yScale = d3
      .scaleLinear()
      .domain([1.5, 9])
      .rangeRound([dimensions.ctrHeight, 0])
      .nice()
      .clamp(true);
    // #endregion
    // #region  Draw Circles
    container
      .selectAll('.pupil-left')
      .data(dataset)
      .join('circle')
      .classed('pupil-left', true)
      .attr('cx', (d) => xScale(xAccessor(d)))
      .attr('cy', (d) => yScale(yAccessorLeft(d)))
      .attr('r', 1)
      // .classed('.okabe-solid-orange', true)
      .attr('fill', ColorPallette.okabe.orange30)
      .attr('stroke', ColorPallette.okabe.orangeSolid)
      .attr('data-temp', yAccessorLeft);

    container
      .selectAll('.pupil-right')
      .data(dataset)
      .join('circle')
      .classed('.pupil-right', true)
      .attr('cx', (d) => xScale(xAccessor(d)))
      .attr('cy', (d) => yScale(yAccessorRight(d)))
      .attr('r', 1)
      .attr('fill', ColorPallette.okabe.cyan30)
      .attr('stroke', ColorPallette.okabe.cyanSolid)
      .attr('data-temp', yAccessorRight);
    // #endregion
    // #region  Axe X
    const xAxis = d3
      .axisBottom(xScale)
      // .ticks(5)
      // .tickFormat((d) => new Date(parseInt(d.toString(), 10)).toString())
      .tickFormat(
        d3.timeFormat('%M:%S') as unknown as (
          dv: number | { valueOf(): number },
          i: number
        ) => string
      );
    // .tickValues([0.4, 0.5, 0.8])

    const xAxisGroup = container
      .append('g')
      .call(xAxis)
      .style('transform', `translateY(${dimensions.ctrHeight}px)`)
      .classed('axis', true);

    xAxisGroup
      .append('text')
      .attr('x', dimensions.ctrWidth / 2)
      .attr('y', dimensions.margin.bottom - 10)
      .attr('fill', 'black')
      .text('Time [m]');
    // #endregion
    // #region Axe Y
    const yAxis = d3.axisLeft(yScale);
    const yAxisGroup = container.append('g').call(yAxis).classed('axis', true);
    yAxisGroup
      .append('text')
      .attr('x', -dimensions.ctrHeight / 2)
      .attr('y', -dimensions.margin.left + 15)
      .attr('fill', 'black')
      .html('Pupil size [mm]')
      .style('transform', 'rotate(270deg)')
      .style('text-anchor', 'middle');
    // #endregion
  }

  render() {
    const { rows, isLoading } = this.state;
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            // this.setState({ isLoading: true });
            ElectronWindow.get().api.ipcRenderer.loadData();
          }}
        >
          Reload Data
        </button>
        {isLoading ? (
          <DefaultLoader />
        ) : (
          <>
            <div className="svg">
              <svg
                className="container"
                ref={(ref: SVGSVGElement) => (this.ref = ref)}
                width="500"
                height="500"
              />
            </div>
            <div>
              <h3>Data count: {rows}</h3>
            </div>
          </>
        )}
      </div>
    );
  }
}
