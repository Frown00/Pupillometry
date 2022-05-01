/* eslint-disable no-return-assign */
import React from 'react';
import * as d3 from 'd3';
import DefaultLoader from '../atoms/Loader';
import Metrics from './Metrics';
import Color from '../../assets/color';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {
  config: IConfig;
  name: string;
  samples: IPupillometry;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IState {
  isLoading: boolean;
}

export default class LineGraph extends React.Component<IProps, IState> {
  ref!: SVGSVGElement;

  constructor(props: IProps) {
    super(props);
    this.state = {
      isLoading: false,
    };
    this.getCurveFunction = this.getCurveFunction.bind(this);
  }

  componentDidMount() {
    // activate
    const { samples } = this.props;
    d3.select(this.ref).selectAll('g').remove();
    this.buildGraph(samples?.samples ?? [], samples.smoothed ?? []);
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
    this.buildGraph(samples?.samples ?? [], samples.smoothed ?? []);
  }

  componentWillUnmount() {
    d3.select(this.ref).selectAll('g').remove();
  }

  getCurveFunction(): any {
    const { config } = this.props;
    return d3.curveLinear;
  }

  getDimensions() {
    const { config } = this.props;
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
    return dimensions;
  }

  // eslint-disable-next-line class-methods-use-this
  private drawCircles(args: {
    container: any;
    dataset: IPupilSample[];
    xScale: any;
    xAccessor: any;
    yScale: any;
    yAccessor: any;
    className: string;
    markProperty: 'leftMark' | 'rightMark';
    color: string;
  }) {
    const {
      container,
      dataset,
      xScale,
      xAccessor,
      yScale,
      yAccessor,
      markProperty,
      className,
      color,
    } = args;
    container
      .selectAll(`.${className}`)
      .data(dataset)
      .join('circle')
      .classed(className, true)
      .attr('visibility', (d: IPupilSample) => {
        if (Number.isNaN(yAccessor(d))) {
          return 'hidden';
        }
        return '';
      })
      .attr('cx', (d: IPupilSample) => xScale(xAccessor(d)))
      .attr('cy', (d: IPupilSample) => yScale(yAccessor(d)))
      .attr('r', (d: any) => {
        const biggerSize = ['invalid', 'outlier'];
        if (biggerSize.includes(d[markProperty]?.type)) return 1.5;
        return 1;
      })
      .attr('fill', color)
      .attr('stroke', (d: IPupilSample) => {
        const marker = d[markProperty];
        if (marker?.type === 'invalid') {
          return Color.chart.invalid;
        }
        if (marker?.type === 'outlier') {
          if (marker.algorithm === 'Dilatation Speed - Gap') {
            return Color.chart.outlier.dilatationSpeed.gap;
          }
          return Color.chart.outlier.dilatationSpeed.speed;
        }
        return color;
      })
      .attr('stroke-width', (d: any) => {
        const biggerSize = ['invalid', 'outlier'];
        if (biggerSize.includes(d[markProperty]?.type)) return 1.5;
        return 1;
      })
      .attr('data-temp', yAccessor);
  }

  private drawLine(args: {
    container: any;
    dataset: IPupilSample[];
    xScale: any;
    xAccessor: any;
    yScale: any;
    yAccessor: any;
    color: string;
  }) {
    const { container, dataset, xScale, xAccessor, yScale, yAccessor, color } =
      args;
    const curve = this.getCurveFunction();
    container
      .append('path')
      .datum(dataset)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1)
      .attr(
        'd',
        d3
          .line()
          .x((d: any) => xScale(xAccessor(d)))
          .y((d: any) => yScale(yAccessor(d)))
          .defined((d: any) => !Number.isNaN(yAccessor(d)))
          .curve(curve)
      );
  }

  private buildGraph(dataset: IPupilSample[], smoothed: IPupilSample[]) {
    const { config } = this.props;
    if (dataset.length <= 0) return;
    // #region Accessors
    const xAccessor = (d: IPupilSample) =>
      d?.timestamp !== undefined ? d.timestamp : '';
    const yAccessorLeft = (d: IPupilSample) =>
      d?.leftPupil ? d.leftPupil : NaN;
    const yAccessorRight = (d: IPupilSample) =>
      d?.rightPupil ? d.rightPupil : NaN;
    const yAccessorMean = (d: IPupilSample) => {
      return d?.mean ? d.mean : NaN;
    };
    // #endregion
    // #region  Dimensions
    const dimensions = this.getDimensions();
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
      .rangeRound([0, dimensions.ctrWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        Math.min(
          d3.min(dataset, yAccessorLeft) ??
            d3.min(dataset, yAccessorMean) ??
            config.markers.outOfRange.max,
          d3.min(dataset, yAccessorRight) ??
            d3.min(dataset, yAccessorMean) ??
            config.markers.outOfRange.max
        ),
        Math.max(
          d3.max(dataset, yAccessorLeft) ??
            d3.max(dataset, yAccessorMean) ??
            config.markers.outOfRange.min,
          d3.max(dataset, yAccessorRight) ??
            d3.max(dataset, yAccessorMean) ??
            config.markers.outOfRange.min
        ),
      ])
      .rangeRound([dimensions.ctrHeight, 0])
      .nice();
    // #endregion

    // #region  Axe X
    const xAxis = d3
      .axisBottom(xScale)
      .tickSize(-dimensions.ctrHeight)
      .ticks(10)
      .tickFormat(
        (x: any) =>
          `${Number.isInteger(x / 1000) ? x / 1000 : (x / 1000).toFixed(3)}`
      );

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
      .text('Time [s]');
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
    if (config.chart.showMeanPlot) {
      if (true) {
        this.drawLine({
          container,
          dataset,
          xScale,
          xAccessor,
          yScale,
          yAccessor: yAccessorMean,
          color: Color.chart.mean,
        });
        if (smoothed.length > 0) {
          this.drawLine({
            container,
            dataset: smoothed,
            xScale,
            xAccessor,
            yScale,
            yAccessor: yAccessorMean,
            color: Color.chart.smooted,
          });
        }
      }
    }

    // #region  Draw Circles
    if (config.chart.showEyesPlot) {
      this.drawCircles({
        container,
        dataset,
        xScale,
        xAccessor,
        yScale,
        yAccessor: yAccessorLeft,
        className: 'pupil-left',
        color: Color.chart.left,
        markProperty: 'leftMark',
      });

      this.drawCircles({
        container,
        dataset,
        xScale,
        xAccessor,
        yScale,
        yAccessor: yAccessorRight,
        className: 'pupil-right',
        color: Color.chart.right,
        markProperty: 'rightMark',
      });
    }
    // #endregion
  }

  render() {
    const { isLoading } = this.state;
    const { name, samples } = this.props;
    return (
      <div>
        {isLoading ? (
          <DefaultLoader />
        ) : (
          <>
            {samples.samples.length ? (
              <div className="svg">
                <svg
                  className="container"
                  ref={(ref: SVGSVGElement) => (this.ref = ref)}
                  width="500"
                  height="500"
                />
              </div>
            ) : (
              ''
            )}
            <Metrics respondentName={name} samples={samples} />
          </>
        )}
      </div>
    );
  }
}
