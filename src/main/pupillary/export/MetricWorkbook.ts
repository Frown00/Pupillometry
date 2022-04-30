import ExcelJS from 'exceljs';
import path from 'path';
import Worksheet from './Worksheet';

export default class MetricWorkbook {
  private workbook: ExcelJS.Workbook;

  // private worksheets: ExcelJS.Worksheet[];

  private group: IGroup;

  private taskGroups: ITaskGroup[];

  constructor(group: IGroup, taskGroups: ITaskGroup[]) {
    this.workbook = new ExcelJS.Workbook();
    this.group = group;
    this.taskGroups = taskGroups;
  }

  addLegend() {
    const legend = this.workbook.addWorksheet('Legend');
    return this;
  }

  addSheets() {
    const pupil01 = new Worksheet(this.workbook.addWorksheet('Pupil01'), {
      measureType: 'mean',
    });
    const pupil02 = new Worksheet(this.workbook.addWorksheet('Pupil02'), {
      measureType: 'min',
    });
    const pupil03 = new Worksheet(this.workbook.addWorksheet('Pupil03'), {
      measureType: 'max',
    });
    // const pupil04 = new Worksheet(this.workbook.addWorksheet('Pupil04'));
    // const pupil05 = new Worksheet(this.workbook.addWorksheet('Pupil05'));

    const metrics = [pupil01, pupil02, pupil03];
    for (let i = 0; i < metrics.length; i += 1) {
      const metric = metrics[i];
      metric.addResults(this.group.respondents, this.taskGroups);
    }
    return this;
  }

  save(exportDir: string) {
    const fileName = `${this.group.name}-metics-${new Date().getTime()}.xlsx`;
    const p = path.join(exportDir, fileName);
    return this.workbook.xlsx.writeFile(p);
  }
}
