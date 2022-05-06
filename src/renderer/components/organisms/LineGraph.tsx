/* eslint-disable no-return-assign */
import React from 'react';
import * as d3 from 'd3';
import DefaultLoader from '../atoms/Loader';
import Color from '../../assets/color';
import type { ChartOption } from './SegmentedLineGraph';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {
  config: IConfig;
  name: string;
  samples: IPupillometry;
  chartType: ChartOption;
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
    const { samples, name, chartType } = this.props;
    const differentTitle = samples !== nextProps.samples;
    const differentDone = name !== nextProps.name;
    const diffChartType = chartType !== nextProps.chartType;
    return differentTitle || differentDone || diffChartType;
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

  private getResultAccessor() {
    const { chartType } = this.props;
    if (chartType === 'Mean')
      return (d: IPupilSample) => (d?.mean ? d.mean : NaN);
    if (chartType === 'Minus Baseline')
      return (d: IPupilSample) => (d?.baselineMinus ? d.baselineMinus : NaN);
    if (chartType === 'Z-Score')
      return (d: IPupilSample) => (d?.zscore ? d.zscore : NaN);
    if (chartType === 'Z-Score -Baseline')
      return (d: IPupilSample) =>
        d?.zscoreMinusBaseline ? d.zscoreMinusBaseline : NaN;
    if (chartType === 'Z-Score /Baseline')
      return (d: IPupilSample) =>
        d?.zscoreDivideBaseline ? d.zscoreDivideBaseline : NaN;
    if (chartType === 'Relative')
      return (d: IPupilSample) => (d?.relative ? d.relative : NaN);
    if (chartType === 'PCPD (ERPD)')
      return (d: IPupilSample) => (d?.erpd ? d.erpd : NaN);

    return (d: IPupilSample) => (d?.baselineDivide ? d.baselineDivide : NaN);
  }

  // eslint-disable-next-line class-methods-use-this
  private getMinDomain(stats?: IPupillometryStats) {
    if (!stats) return -1;
    const { config } = this.props;
    if (config.chart.showMeanPlot && config.chart.showSmoothed) {
      const arr = [stats.result.min, stats.resultSmoothed?.min || Infinity];
      return Math.min(...arr);
    }
    if (config.chart.showMeanPlot) return stats.result.min;
    return stats.resultSmoothed.min;
  }

  // eslint-disable-next-line class-methods-use-this
  private getMaxDomain(stats?: IPupillometryStats) {
    if (!stats) return 1;
    const { config } = this.props;
    if (config.chart.showMeanPlot && config.chart.showSmoothed) {
      const arr = [stats.result.max, stats.resultSmoothed?.max || Infinity];
      return Math.min(...arr);
    }
    if (config.chart.showMeanPlot) return stats.result.max;
    return stats.resultSmoothed.max;
  }

  private getDomain() {
    const { samples, chartType, config } = this.props;
    const { stats, baseline, zscore, percent } = samples;
    if (chartType === 'Mean') {
      const includeBothPupils =
        config.chart.showEyesPlot && 'leftPupil' in samples.samples[0];
      const minValues = includeBothPupils
        ? [stats.right.min, stats.left.min, stats.result.min]
        : [stats.result.min, stats.resultSmoothed.min || Infinity];
      const maxValues = includeBothPupils
        ? [stats.right.max, stats.left.max, stats.result.max]
        : [stats.result.max, stats.resultSmoothed?.max || -Infinity];
      const min = Math.min(...minValues);
      const max = Math.max(...maxValues);
      return [min, max];
    }
    if (chartType === 'Minus Baseline') {
      const min = this.getMinDomain(baseline?.minusStats);
      const max = this.getMaxDomain(baseline?.minusStats);
      return [min, max];
    }
    if (chartType === 'Z-Score') {
      const min = this.getMinDomain(zscore?.standard);
      const max = this.getMaxDomain(zscore?.standard);
      return [min, max];
    }
    if (chartType === 'Z-Score -Baseline') {
      const min = this.getMinDomain(zscore?.minusBaseline);
      const max = this.getMaxDomain(zscore?.minusBaseline);
      return [min, max];
    }
    if (chartType === 'Z-Score /Baseline') {
      const min = this.getMinDomain(zscore?.divideBaseline);
      const max = this.getMaxDomain(zscore?.divideBaseline);
      return [min, max];
    }
    if (chartType === 'Relative') {
      const min = this.getMinDomain(percent?.relative);
      const max = this.getMaxDomain(percent?.relative);
      return [min, max];
    }
    if (chartType === 'PCPD (ERPD)') {
      const min = this.getMinDomain(percent?.erpd);
      const max = this.getMaxDomain(percent?.erpd);
      return [min, max];
    }
    const min = this.getMinDomain(baseline?.divideStats);
    const max = this.getMaxDomain(baseline?.divideStats);
    return [min, max];
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
    const { config, chartType } = this.props;
    // eslint-disable-next-line no-param-reassign
    if (dataset.length <= 0 && smoothed.length <= 0) return;
    // #region Accessors
    const xAccessor = (d: IPupilSample) =>
      d?.timestamp !== undefined ? d.timestamp : '';
    const yAccessorLeft = (d: IPupilSample) =>
      d?.leftPupil ? d.leftPupil : NaN;
    const yAccessorRight = (d: IPupilSample) =>
      d?.rightPupil ? d.rightPupil : NaN;
    const yAccessorResult = this.getResultAccessor();

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
    const min =
      dataset.length > 0 ? dataset[0].timestamp : smoothed[0].timestamp;
    const max =
      dataset.length > 0
        ? dataset[dataset.length - 1].timestamp
        : smoothed[smoothed.length - 1].timestamp;

    const xScale = d3
      .scaleLinear()
      .domain([min, max])
      .rangeRound([0, dimensions.ctrWidth]);

    const yScale = d3
      .scaleLinear()
      .domain(this.getDomain())
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
    const percentChartTypes: ChartOption[] = ['PCPD (ERPD)', 'Relative'];
    const noUnitChartTypes: ChartOption[] = [
      'Z-Score',
      'Z-Score -Baseline',
      'Z-Score /Baseline',
    ];
    let yUnit = '[mm]';
    if (percentChartTypes.includes(chartType)) yUnit = '%';
    if (noUnitChartTypes.includes(chartType)) yUnit = '';
    yAxisGroup
      .append('text')
      .attr('x', -dimensions.ctrHeight / 2)
      .attr('y', -dimensions.margin.left + 15)
      .attr('fill', 'black')
      .html(`Pupil size ${yUnit}`)
      .style('transform', 'rotate(270deg)')
      .style('text-anchor', 'middle');
    // grid line
    container.append('g').attr('class', 'y axis-grid').call(yAxis);
    // #endregion

    // container
    if (config.chart.showMeanPlot || config.chart.showSmoothed) {
      if (dataset.length > 0) {
        this.drawLine({
          container,
          dataset,
          xScale,
          xAccessor,
          yScale,
          yAccessor: yAccessorResult,
          color: Color.chart.mean,
        });
      }
      if (smoothed.length > 0) {
        this.drawLine({
          container,
          dataset: smoothed,
          xScale,
          xAccessor,
          yScale,
          yAccessor: yAccessorResult,
          color: Color.chart.smooted,
        });
      }
    }

    // #region  Draw Circles
    if (config.chart.showEyesPlot && chartType === 'Mean') {
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
    // eslint-disable-next-line promise/catch-or-return
    // eslint-disable-next-line promise/always-return
    // d3ToPng('.container', 'some-name')
    //   .then((fileData) => {
    //     // eslint-disable-next-line no-console
    //     console.log(fileData);
    //     return fileData;
    //   })
    //   .catch((err) => console.log(err));
  }

  render() {
    const { isLoading } = this.state;
    const { samples } = this.props;
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
          </>
        )}
      </div>
    );
  }
}
