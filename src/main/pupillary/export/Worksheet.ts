import ExcelJS from 'exceljs';
import { average, median } from 'simple-statistics';
import { mergeString } from './utils';

type PupilMeasure =
  | 'mean' // 1
  | 'min' // 2
  | 'max' // 3
  | 'baseline mean' // 4
  | 'baseline min' // 5
  | 'baseline max' // 6
  | 'divide baseline mean' // 7
  | 'divide baseline min' // 8
  | 'divide baseline max' // 9
  | 'z-score mean' // 10
  | 'z-score min' // 11
  | 'z-score max' // 12
  | 'z-score -baseline mean' // 13
  | 'z-score -baseline min' // 14
  | 'z-score -baseline max' // 15
  | 'z-score /baseline mean' // 16
  | 'z-score /baseline min' // 17
  | 'z-score /baseline max' // 18
  | 'relative mean' // 19
  | 'relative min' // 20
  | 'relative max' // 21
  | 'PCPD mean' // 22
  | 'PCPD min' // 23
  | 'PCPD max'; // 24

interface IWorksheetConfig {
  measureType: PupilMeasure;
}

export default class Worksheet {
  private worksheet: ExcelJS.Worksheet;

  private config: IWorksheetConfig;

  constructor(worksheet: ExcelJS.Worksheet, config: IWorksheetConfig) {
    this.worksheet = worksheet;
    this.config = config;
  }

  private addHeaders(taskGroup: ITaskGroup[], summary: string[]) {
    const h1 = [''];
    const h2 = ['Tasks'];
    const h3 = ['#participant'];
    const merges: [number, number][] = [];
    for (let i = 0; i < taskGroup.length; i += 1) {
      const group = taskGroup[i];
      const [, lastTo] = merges?.[merges.length - 1] ?? [];
      const mergeFrom = lastTo + 1 || h2.length;
      const mergeTo = mergeFrom + group.tasks.length - 1 + summary.length;
      merges.push([mergeFrom, mergeTo]);
      h1.push(group.name);
      h1.push(...new Array(group.tasks.length - 1 + summary.length).fill(''));
      h2.push(...group.tasks, ...summary);
      h3.push(
        ...new Array(group.tasks.length + summary.length).fill(
          this.worksheet.name
        )
      );
    }
    this.worksheet.views[0] = {
      state: 'frozen',
      xSplit: 1,
      ySplit: 3,
    };
    this.worksheet.addRows([h1, h2, h3]);
    merges.map((m) => {
      const mergeStr = mergeString(1, m[0], m[1]);
      this.worksheet.mergeCells(mergeStr);
      this.worksheet.getCell(mergeStr).alignment = { horizontal: 'center' };
      return true;
    });
    this.worksheet.columns.forEach((column) => {
      if (!column.header?.length) {
        column.width = 16;
      } else if (column.values) {
        column.width = Math.max(
          ...column.values.map((v) => v!.toString().length)
        );
      } else
        column.width = column.header.length < 16 ? 16 : column.header.length;
    });
    return this;
  }

  addResults(results: IPupillometryResult[], taskGroup: ITaskGroup[]) {
    if (!results.length) return;
    const groups = taskGroup?.length
      ? taskGroup
      : [
          {
            name: 'Entire Study',
            tasks: results.map((r) => r.segments.map((s) => s.name)).flat(),
          },
        ];
    const summary = ['B', 'Avg', 'Med', 'Avg/B', 'Med/B', 'Avg-B', 'Med-B'];

    this.addHeaders(groups, summary);

    const taskRow = <ExcelJS.CellValue[]>this.worksheet.getRow(2).values;
    // starts from 3 cause first value is from some reason empty (normally should be 2)
    const startFrom = 2;
    for (let r = 0; r < results.length; r += 1) {
      const data = results[r];
      const row: (string | number)[] = [data.name];
      let values: number[] = [];
      let baselines: number[] = [];
      let value: number | string = '';
      let isCalculating = false;
      for (let i = startFrom; i < taskRow.length; i += 1) {
        const taskName = taskRow[i];
        const wantedResult = data.segments.find((s) => s.name === taskName);
        const calculation = summary.find((s) => s === taskName);

        if (calculation) {
          value = this.getCalculation(calculation, values, baselines);
          isCalculating = true;
        } else {
          value = this.getValue(wantedResult) || '';
          if (value !== '' && value !== 'INVALID') {
            values.push(<number>value);
            if (wantedResult?.baseline?.value)
              baselines.push(wantedResult?.baseline?.value);
          }
          if (isCalculating) {
            isCalculating = false;
            values = [];
            baselines = [];
          }
        }
        if (value === 'INVALID') {
          row.push(value);
        } else {
          row.push(value ? Number(Number(value).toFixed(5)) : '');
        }
      }
      this.worksheet.addRow(row);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getCalculation(
    calcType: string,
    values: number[],
    baselines: number[]
  ) {
    const baseline = baselines.length ? average(baselines) : '';
    if (calcType === 'B') return baseline;
    if (calcType === 'Avg') return values.length ? average(values) : '';
    if (calcType === 'Med') return values.length ? median(values) : '';
    if (calcType === 'Avg/B')
      return values.length && baseline !== '' ? average(values) / baseline : '';
    if (calcType === 'Med/B')
      return values.length && baseline !== '' ? median(values) / baseline : '';
    if (calcType === 'Avg-B')
      return values.length && baseline !== '' ? average(values) - baseline : '';
    if (calcType === 'Med-B')
      return values.length && baseline !== '' ? median(values) - baseline : '';
    return '';
  }

  private getValue(p: IPupillometry | undefined) {
    if (!p) return '';
    if (p.classification !== 'Valid') return 'INVALID';
    if (this.config.measureType === 'mean')
      return p.stats.resultSmoothed.mean || p.stats.result.mean;
    if (this.config.measureType === 'min')
      return p.stats.resultSmoothed.min || p.stats.result.min;
    if (this.config.measureType === 'max')
      return p.stats.resultSmoothed.max || p.stats.result.max;
    if (this.config.measureType === 'baseline mean')
      return (
        p.baseline?.minusStats.resultSmoothed.mean ||
        p.baseline?.minusStats.result.mean
      );
    if (this.config.measureType === 'baseline min')
      return (
        p.baseline?.minusStats.resultSmoothed.min ||
        p.baseline?.minusStats.result.min
      );
    if (this.config.measureType === 'baseline max')
      return (
        p.baseline?.minusStats.resultSmoothed.max ||
        p.baseline?.minusStats.result.max
      );
    if (this.config.measureType === 'divide baseline mean')
      return (
        p.baseline?.divideStats.resultSmoothed.mean ||
        p.baseline?.divideStats.result.mean
      );
    if (this.config.measureType === 'divide baseline min')
      return (
        p.baseline?.divideStats.resultSmoothed.min ||
        p.baseline?.divideStats.result.min
      );
    if (this.config.measureType === 'divide baseline max')
      return (
        p.baseline?.divideStats.resultSmoothed.max ||
        p.baseline?.divideStats.result.max
      );
    if (this.config.measureType === 'z-score mean')
      return (
        p.zscore?.standard.resultSmoothed.mean || p.zscore?.standard.result.mean
      );
    if (this.config.measureType === 'z-score min')
      return (
        p.zscore?.standard.resultSmoothed.min || p.zscore?.standard.result.min
      );
    if (this.config.measureType === 'z-score max')
      return (
        p.zscore?.standard.resultSmoothed.max || p.zscore?.standard.result.max
      );
    if (this.config.measureType === 'z-score -baseline mean')
      return (
        p.zscore?.minusBaseline.resultSmoothed.mean ||
        p.zscore?.minusBaseline.result.mean
      );
    if (this.config.measureType === 'z-score -baseline min')
      return (
        p.zscore?.minusBaseline.resultSmoothed.min ||
        p.zscore?.minusBaseline.result.min
      );
    if (this.config.measureType === 'z-score -baseline max')
      return (
        p.zscore?.minusBaseline.resultSmoothed.max ||
        p.zscore?.minusBaseline.result.max
      );
    if (this.config.measureType === 'z-score /baseline mean')
      return (
        p.zscore?.divideBaseline.resultSmoothed.mean ||
        p.zscore?.divideBaseline.result.mean
      );
    if (this.config.measureType === 'z-score /baseline min')
      return (
        p.zscore?.divideBaseline.resultSmoothed.min ||
        p.zscore?.divideBaseline.result.min
      );
    if (this.config.measureType === 'z-score /baseline max')
      return (
        p.zscore?.divideBaseline.resultSmoothed.max ||
        p.zscore?.divideBaseline.result.max
      );
    if (this.config.measureType === 'relative mean')
      return (
        p.percent?.relative.resultSmoothed.mean ||
        p.percent?.relative.result.mean
      );
    if (this.config.measureType === 'relative min')
      return (
        p.percent?.relative.resultSmoothed.min || p.percent?.relative.result.min
      );
    if (this.config.measureType === 'relative max')
      return (
        p.percent?.relative.resultSmoothed.max || p.percent?.relative.result.max
      );
    if (this.config.measureType === 'PCPD mean')
      return p.percent?.erpd.resultSmoothed.mean || p.percent?.erpd.result.mean;
    if (this.config.measureType === 'PCPD min')
      return p.percent?.erpd.resultSmoothed.min || p.percent?.erpd.result.min;
    if (this.config.measureType === 'PCPD max')
      return p.percent?.erpd.resultSmoothed.max || p.percent?.erpd.result.max;
    return '';
  }
}
