import ExcelJS from 'exceljs';
import { average, median } from 'simple-statistics';
import { mergeString } from './utils';

type PupilMeasure =
  | 'mean'
  | 'min'
  | 'max'
  | 'baseline mean'
  | 'baseline min'
  | 'baseline max'
  | 'divide baseline mean'
  | 'divide baseline min'
  | 'divide baseline max'
  | 'z-score mean'
  | 'z-score min'
  | 'z-score max'
  | 'relative min'
  | 'PCPD';

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
    const h1 = ['', 'Baseline'];
    const h2 = ['Tasks', 't0'];
    const h3 = ['#participant', this.worksheet.name];
    const merges: [number, number][] = [];
    for (let i = 0; i < taskGroup.length; i += 1) {
      const group = taskGroup[i];
      const [, lastTo] = merges?.[merges.length - 1] ?? [];
      const mergeFrom = lastTo + 1 || h2.length;
      const mergeTo = mergeFrom + group.tasks.length - 1 + summary.length;
      merges.push([mergeFrom, mergeTo]);
      h1.push(group.name);
      h1.push(...new Array(group.tasks.length - 1).fill(''));
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
      if (!column.header?.length) column.width = 12;
      else column.width = column.header.length < 12 ? 12 : column.header.length;
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
    const summary = ['Avg', 'Med', 'Avg/t0', 'Med/t0', 'Avg-t0', 'Med-t0'];

    this.addHeaders(groups, summary);

    const taskRow = <ExcelJS.CellValue[]>this.worksheet.getRow(2).values;
    // starts from 3 cause first value is from some reason empty (normally should be 2)
    const startFrom = 3;
    for (let r = 0; r < results.length; r += 1) {
      const data = results[r];
      const row: (string | number)[] = [data.name, -1];
      let arr: number[] = [];
      let value: number | string = '';
      let isCalculating = false;
      for (let i = startFrom; i < taskRow.length; i += 1) {
        const taskName = taskRow[i];
        const wantedResult = data.segments.find((s) => s.name === taskName);
        const calculation = summary.find((s) => s === taskName);

        if (calculation) {
          value = this.getCalculation(calculation, arr);
          isCalculating = true;
        } else {
          value = this.getValue(wantedResult?.stats) || '';
          if (value !== '') arr.push(<number>value);
          if (isCalculating) {
            isCalculating = false;
            arr = [];
          }
        }
        row.push(value);
      }
      this.worksheet.addRow(row);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getCalculation(calcType: string, values: number[]) {
    if (calcType === 'Avg') return average(values);
    if (calcType === 'Med') return median(values);
    if (calcType === 'Avg/t0') return average(values) / 1;
    if (calcType === 'Med/t0') return median(values) / 1;
    if (calcType === 'Avg-t0') return average(values) - 0;
    if (calcType === 'Med-t0') return median(values) - 0;
    return '';
  }

  private getValue(stats: IPupillometryStats | undefined) {
    if (this.config.measureType === 'mean') return stats?.result.mean;
    if (this.config.measureType === 'min') return stats?.result.min;
    if (this.config.measureType === 'max') return stats?.result.max;
    return '';
  }
}
