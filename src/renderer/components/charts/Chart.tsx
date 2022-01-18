/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/state-in-constructor */
/* eslint-disable no-return-assign */
import React from 'react';
import * as d3 from 'd3';
import DefaultLoader from '../Loader';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {
  config: IConfig;
  name: string;
  samples: IPupillometry;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IState {
  data: any[];
  isLoading: boolean;
}

const ColorPallette = {
  okabe: {
    orangeSolid: 'rgba(230, 159, 0, 1)',
    orange80: 'rgba(230, 159, 0, 0.8)',
    orange30: 'rgba(230, 159, 0, 0.3)',
    cyanSolid: 'rgba(86, 180, 233, 1)',
    cyan80: 'rgba(86, 180, 233, 0.8)',
    cyan30: 'rgba(86, 180, 233, 0.3)',
    greenSolid: 'rgba(0,158,115, 1)',
    green80: 'rgba(0,158,115, 0.8)',
    green30: 'rgba(0,158,115, 0.3)',
  },
};

export default class Chart extends React.Component<IProps, IState> {
  ref!: SVGSVGElement;

  state = {
    data: [1, 2, 3, 4, 5],
    isLoading: false,
    name: '',
  };

  componentDidMount() {
    // activate
    const { samples } = this.props;
    d3.select(this.ref).selectAll('g').remove();
    this.buildGraph(samples?.validSamples ?? []);
  }

  shouldComponentUpdate(nextProps: IProps) {
    const { samples, name } = this.props;
    const differentTitle = samples !== nextProps.samples;
    const differentDone = name !== nextProps.name;
    return differentTitle || differentDone;
  }

  componentDidUpdate() {
    const { samples } = this.props;
    d3.select(this.ref).selectAll('g').remove();
    this.buildGraph(samples?.validSamples ?? []);
  }

  componentWillUnmount() {
    d3.select(this.ref).selectAll('g').remove();
  }

  private buildGraph(dataset: any[]) {
    const { config } = this.props;
    if (dataset.length <= 0) return;
    // #region Accessors
    const xAccessor = (d: IPupilSamplePreprocessed) => d.timestamp;
    const yAccessorLeft = (d: IPupilSamplePreprocessed) => d?.leftPupil ?? NaN;
    const yAccessorRight = (d: IPupilSamplePreprocessed) =>
      d?.rightPupil ?? NaN;
    const yAccessorMean = (d: IPupilSamplePreprocessed) => d?.meanPupil ?? NaN;

    const time = '%M:%S'; // TODO config
    const formatMillisecond = d3.timeFormat('.%L');
    // #endregion
    // #region  Dimensions
    const dimensions = {
      width: config.chart.width,
      height: config.chart.height,
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
      .domain([dataset[0].timestamp, dataset[dataset.length - 1].timestamp])
      .rangeRound([0, dimensions.ctrWidth])
      .clamp(true);

    const yScale = d3
      .scaleLinear()
      .domain([
        Math.min(
          d3.min(dataset, yAccessorLeft) ?? config.processing.pupil.max,
          d3.min(dataset, yAccessorRight) ?? config.processing.pupil.max
        ),
        Math.max(
          d3.max(dataset, yAccessorLeft) ?? config.processing.pupil.min,
          d3.max(dataset, yAccessorRight) ?? config.processing.pupil.min
        ),
      ])
      .rangeRound([dimensions.ctrHeight, 0])
      .nice()
      .clamp(true);
    // #endregion

    // #region  Axe X
    const xAxis = d3
      .axisBottom(xScale)
      // .ticks(5)
      // .tickFormat((d) => new Date(parseInt(d.toString(), 10)).toString())
      .tickSize(-dimensions.ctrHeight)
      .ticks(10)
      .tickFormat(
        d3.timeFormat('%s.%L') as unknown as (
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

    // grid line
    container
      .append('g')
      .call(xAxis)
      .attr('class', 'x axis-grid')
      .attr('transform', `translate(0,${dimensions.ctrHeight})`);

    xAxisGroup
      .append('text')
      .attr('x', dimensions.ctrWidth / 2)
      .attr('y', dimensions.margin.bottom - 10)
      .attr('fill', 'black')
      .text('Time [m]');
    // #endregion
    // #region Axe Y
    const yAxis = d3.axisLeft(yScale).tickSize(-dimensions.ctrWidth).ticks(10);
    const yAxisGroup = container.append('g').call(yAxis).classed('axis', true);
    yAxisGroup
      .append('text')
      .attr('x', -dimensions.ctrHeight / 2)
      .attr('y', -dimensions.margin.left + 15)
      .attr('fill', 'black')
      .html('Pupil size [mm]')
      .style('transform', 'rotate(270deg)')
      .style('text-anchor', 'middle');
    // grid line
    container.append('g').attr('class', 'y axis-grid').call(yAxis);
    // #endregion

    // container
    //   .append('path')
    //   .datum(dataset)
    //   .attr('fill', 'none')
    //   .attr('stroke', ColorPallette.okabe.orangeSolid)
    //   .attr('stroke-width', 1.5)
    //   .attr(
    //     'd',
    //     d3
    //       .line()
    //       .x((d: any) => xScale(xAccessor(d)))
    //       .y((d: any) => yScale(yAccessorMean(d)))
    //     // .defined((d: IPupilSample) => {
    //     //   return yScale(yAccessorLeft(d)) > 0;
    //     // })
    //   );
    if (config.chart.showMeanPlot) {
      if (config.processing.interpolation.on) {
        container
          .append('path')
          .datum(dataset)
          .attr('fill', 'none')
          .attr('stroke', ColorPallette.okabe.greenSolid)
          .attr('stroke-width', 1.5)
          .attr(
            'd',
            d3
              .line()
              .x((d: any) => xScale(xAccessor(d)))
              .y((d: any) => yScale(yAccessorMean(d)))
              .curve(d3.curveBundle.beta(1))
            // .defined((d: IPupilSample) => {
            //   return yScale(yAccessorRight(d)) > 0
            //     ? yScale(yAccessorRight(d))
            //     : null;
            // })
          );
      } else {
        container
          .selectAll('.pupil-mean')
          .data(dataset)
          .join('circle')
          .classed('.pupil-mean', true)
          .attr('cx', (d) => xScale(xAccessor(d)))
          .attr('cy', (d) => yScale(yAccessorMean(d)))
          .attr('visibility', (d) => {
            if (Number.isNaN(yAccessorMean(d))) return 'hidden';
            return '';
          })
          .attr('r', 1)
          .attr('fill', ColorPallette.okabe.green30)
          .attr('stroke', ColorPallette.okabe.greenSolid)
          .attr('data-temp', yAccessorMean);
      }
    }

    // #region  Draw Circles
    if (config.chart.showEyesPlot) {
      container
        .selectAll('.pupil-left')
        .data(dataset)
        .join('circle')
        .classed('pupil-left', true)
        .attr('visibility', (d: any) => {
          if (Number.isNaN(yAccessorLeft(d))) return 'hidden';
          return '';
        })
        .attr('cx', (d: any) => xScale(xAccessor(d)))
        .attr('cy', (d: any) => yScale(yAccessorLeft(d)))
        .attr('r', 1)
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
        .attr('visibility', (d) => {
          if (Number.isNaN(yAccessorRight(d))) return 'hidden';
          return '';
        })
        .attr('r', 1)
        .attr('fill', ColorPallette.okabe.cyan30)
        .attr('stroke', ColorPallette.okabe.cyanSolid)
        .attr('data-temp', yAccessorRight);
    }
    // #endregion
  }

  render() {
    const { isLoading } = this.state;
    const { name, samples } = this.props;
    const { stats } = samples;
    return (
      <div>
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '30%',
              }}
            >
              <p style={{ display: 'flex' }}>
                <span className="pupil-label">Respondent:</span> <b>{name}</b>
              </p>
              <p style={{ display: 'flex' }}>
                <span className="pupil-label">Segment:</span>{' '}
                <b>{samples?.name ?? ''}</b>
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '70%',
              }}
            >
              <div>
                <h3>Metrics</h3>
                <p style={{ display: 'flex' }}>
                  <span className="pupil-label">Mean:</span>
                  {stats.mean}
                </p>
                <p style={{ display: 'flex' }}>
                  <span className="pupil-label">Min:</span> {stats.min}
                </p>
                <p style={{ display: 'flex' }}>
                  <span className="pupil-label">Max:</span> {stats.max}
                </p>
                <p style={{ display: 'flex' }}>
                  <span className="pupil-label">Std:</span> {stats.std}
                </p>
              </div>
              <div>
                <h3>Pupil Samples</h3>
                <p style={{ display: 'flex' }}>
                  <span className="pupil-label">Raw count:</span>{' '}
                  {stats.rawSamplesCount}
                </p>
                <p style={{ display: 'flex' }}>
                  <span className="pupil-label">Valid count:</span>{' '}
                  {stats.validSamples}
                </p>
                <p style={{ display: 'flex' }}>
                  <span className="pupil-label">Eye difference: </span>
                  {stats.meanPupilDifference?.toFixed(2)} mm
                </p>
                <p style={{ display: 'flex' }}>
                  <span className="pupil-label">Pupil correlation: </span>
                  {stats.pupilCorrelation?.toFixed(2)}
                </p>
              </div>
              <div>
                <h3>Missing</h3>
                <p style={{ display: 'flex' }}>
                  <span className="pupil-label">General:</span>{' '}
                  {(
                    (stats.missing.general / stats.rawSamplesCount) *
                    100
                  )?.toFixed(2)}
                  %
                </p>
                <p style={{ display: 'flex' }}>
                  <span className="pupil-label">Right:</span>{' '}
                  {(
                    (stats.missing.rightPupil / stats.rawSamplesCount) *
                    100
                  )?.toFixed(2)}
                  %
                </p>
                <p style={{ display: 'flex' }}>
                  <span className="pupil-label">Left: </span>{' '}
                  {(
                    (stats.missing.leftPupil / stats.rawSamplesCount) *
                    100
                  )?.toFixed(2)}
                  %
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}
