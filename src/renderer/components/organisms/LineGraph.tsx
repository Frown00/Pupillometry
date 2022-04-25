/* eslint-disable no-return-assign */
import React from 'react';
import * as d3 from 'd3';
import DefaultLoader from '../atoms/Loader';
import Metrics from './Metrics';

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

const ColorPallette = {
  okabe: {
    orange: 'rgba(230, 159, 0, 1)',
    cyan: 'rgba(86, 180, 233, 1)',
    green: 'rgba(0,158,115, 1)',
    vermillion: 'rgba(213, 94, 0, 1)',
    purple: 'rgba(204, 121, 167, 1)',
    black: 'rgba(0, 0, 0, 1)',
    blue: 'rgba(0, 114, 178, 1)',
  },
};

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
        if (biggerSize.includes(d[markProperty]?.type)) return 2;
        return 1;
      })
      .attr('fill', color)
      .attr('stroke', (d: IPupilSample) => {
        const marker = d[markProperty];
        if (marker?.type === 'invalid') {
          return ColorPallette.okabe.vermillion;
        }
        if (marker?.type === 'outlier') {
          if (marker.algorithm === 'Dilatation Speed - Gap') {
            return ColorPallette.okabe.black;
          }
          return ColorPallette.okabe.orange;
        }
        return color;
      })
      .attr('stroke-width', (d: any) => {
        const biggerSize = ['invalid', 'outlier'];
        if (biggerSize.includes(d[markProperty]?.type)) return 2;
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
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line()
          .x((d: any) => xScale(xAccessor(d)))
          .y((d: any) => yScale(yAccessor(d)))
          .curve(curve)
      );
  }

  private buildGraph(dataset: IPupilSample[], smoothed: IPupilSample[]) {
    const { config } = this.props;
    if (dataset.length <= 0) return;
    // #region Accessors
    const xAccessor = (d: IPupilSample) => d.timestamp;
    const yAccessorLeft = (d: IPupilSample) =>
      d?.leftPupil ? d.leftPupil : NaN;
    const yAccessorRight = (d: IPupilSample) =>
      d?.rightPupil ? d.rightPupil : NaN;
    const yAccessorMean = (d: IPupilSample) => {
      return d?.mean ? d.mean : NaN;
    };

    const time = '%M:%S'; // TODO config
    const formatMillisecond = d3.timeFormat('.%L');

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
      .rangeRound([0, dimensions.ctrWidth])
      .clamp(true);

    const yScale = d3
      .scaleLinear()
      .domain([
        Math.min(
          d3.min(dataset, yAccessorLeft) ?? config.markers.outOfRange.max,
          d3.min(dataset, yAccessorRight) ?? config.markers.outOfRange.max
        ),
        Math.max(
          d3.max(dataset, yAccessorLeft) ?? config.markers.outOfRange.min,
          d3.max(dataset, yAccessorRight) ?? config.markers.outOfRange.min
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
          color: ColorPallette.okabe.cyan,
        });
        this.drawLine({
          container,
          dataset: smoothed,
          xScale,
          xAccessor,
          yScale,
          yAccessor: yAccessorMean,
          color: ColorPallette.okabe.blue,
        });
      } else {
        this.drawCircles({
          container,
          dataset,
          xScale,
          xAccessor,
          yScale,
          yAccessor: yAccessorLeft,
          className: 'pupil-mean',
          color: ColorPallette.okabe.cyan,
          markProperty: 'leftMark',
        });
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
        color: ColorPallette.okabe.green,
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
        color: ColorPallette.okabe.purple,
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
