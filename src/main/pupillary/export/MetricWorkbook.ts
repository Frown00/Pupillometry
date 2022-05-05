import ExcelJS from 'exceljs';
import path from 'path';
import { mergeString } from './utils';
import Worksheet from './Worksheet';

export default class MetricWorkbook {
  private workbook: ExcelJS.Workbook;

  private group: IGroup;

  private taskGroups: ITaskGroup[];

  constructor(group: IGroup, taskGroups: ITaskGroup[]) {
    this.workbook = new ExcelJS.Workbook();
    this.group = group;
    this.taskGroups = taskGroups;
  }

  addInfoSheet() {
    const info = this.workbook.addWorksheet('Info');
    const h1 = ['Group Name:', this.group.name];
    const h2 = ['Is Dependent:', this.group.isDependant];
    const h3 = ['Participants:', this.group.respondents.length];
    const h4 = [''];
    const h5 = ['METRICS'];

    const h6 = ['Name', 'Formula', 'Description'];
    const p1 = [
      'Pupil01',
      'MEAN(mean(i))',
      'Mean of pupil means (prefer smoothed value)',
    ];
    const p2 = [
      'Pupil02',
      'MIN(mean(i))',
      'Min of all pupil means (prefer smoothed value)',
    ];
    const p3 = [
      'Pupil03',
      'MAX(mean(i))',
      'Max of all pupil means (prefer smoothed value)',
    ];
    const p4 = [
      'Pupil04',
      'MEAN(mean(i) - baseline)',
      'Mean of corrected pupil means (prefer smoothed value)',
    ];
    const p5 = [
      'Pupil05',
      'MIN(mean(i) - baseline)',
      'Min of all corrected pupil means (prefer smoothed value)',
    ];
    const p6 = [
      'Pupil06',
      'MAX(mean(i) - baseline)',
      'Max of all corrected pupil means (prefer smoothed value)',
    ];
    const p7 = [
      'Pupil07',
      'MEAN(mean(i) / baseline)',
      'Mean of corrected pupil means (prefer smoothed value)',
    ];
    const p8 = [
      'Pupil08',
      'MIN(mean(i) / baseline)',
      'Min of all corrected pupil means (prefer smoothed value)',
    ];
    const p9 = [
      'Pupil09',
      'MAX(mean(i) / baseline)',
      'Max of all corrected pupil means (prefer smoothed value)',
    ];
    const p10 = [
      'Pupil10',
      'MEAN(mean(i) - mean(grand)) / std(grand))',
      'Mean of Z-Score,grand is value from all trial (prefer smoothed value)',
    ];
    const p11 = [
      'Pupil11',
      'MIN(mean(i) - mean(grand)) / std(grand))',
      'Min of Z-Score, grand is value from all trial (prefer smoothed value)',
    ];
    const p12 = [
      'Pupil12',
      'MAX(mean(i) - mean(grand)) / std(grand))',
      'Max of Z-Score, grand is value from all trial (prefer smoothed value)',
    ];
    const p13 = [
      'Pupil13',
      'MEAN(mean(i) - baseline - mean(grand)) / std(grand))',
      'Mean of corrected Z-Score, grand is corrected value from all trial (prefer smoothed value)',
    ];
    const p14 = [
      'Pupil14',
      'MIN(mean(i) - baseline - mean(grand)) / std(grand))',
      'Min of corrected Z-Score, grand is corrected value from all trial (prefer smoothed value)',
    ];
    const p15 = [
      'Pupil15',
      'MAX(mean(i) - baseline - mean(grand)) / std(grand))',
      'Max of corrected Z-Score, grand is corrected value from all trial (prefer smoothed value)',
    ];
    const p16 = [
      'Pupil16',
      'MEAN(mean(i) / baseline - mean(grand)) / std(grand))',
      'Mean of corrected Z-Score, grand is corrected value from all trial (prefer smoothed value)',
    ];
    const p17 = [
      'Pupil17',
      'MIN(mean(i) / baseline - mean(grand)) / std(grand))',
      'Min of corrected Z-Score, grand is corrected value from all trial (prefer smoothed value)',
    ];
    const p18 = [
      'Pupil18',
      'MAX(mean(i) / baseline - mean(grand)) / std(grand))',
      'Max of corrected Z-Score, grand is corrected value from all trial (prefer smoothed value)',
    ];
    const p19 = [
      'Pupil19',
      'MEAN((mean(i) - mean(grand)) / mean(grand)) * 100',
      'Mean of relative value in %, grand is corrected value from all trial (prefer smoothed value)',
    ];
    const p20 = [
      'Pupil20',
      'MIN((mean(i) - mean(grand)) / mean(grand)) * 100',
      'Min of relative value in %, grand is corrected value from all trial (prefer smoothed value)',
    ];
    const p21 = [
      'Pupil21',
      'MAX((mean(i) - mean(grand)) / mean(grand)) * 100',
      'Max of relative value expressed in %, grand is corrected value from all trial (prefer smoothed value)',
    ];
    const p22 = [
      'Pupil22',
      'MEAN((mean(i) - baseline) / baseline) * 100',
      'Mean of pcpd/erpd expressed in % (prefer smoothed value)',
    ];
    const p23 = [
      'Pupil23',
      'MIN((mean(i) - baseline) / baseline) * 100',
      'Min of pcpd/erpd expressed in % (prefer smoothed value)',
    ];
    const p24 = [
      'Pupil24',
      'MAX((mean(i) - baseline) / baseline) * 100',
      'Max of pcpd/erpd expressed in % (prefer smoothed value)',
    ];

    info.addRows([
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      p1,
      p2,
      p3,
      p4,
      p5,
      p6,
      p7,
      p8,
      p9,
      p10,
      p11,
      p12,
      p13,
      p14,
      p15,
      p16,
      p17,
      p18,
      p19,
      p20,
      p21,
      p22,
      p23,
      p24,
    ]);
    const metricMerged = mergeString(5, 0, 3);
    info.mergeCells(metricMerged);
    info.getCell(metricMerged).alignment = { horizontal: 'center' };
    info.getCell(metricMerged).font = { bold: true, size: 20 };
    info.getCell('A:6').font = { bold: true };
    info.getCell('B:6').font = { bold: true };
    info.getCell('C:6').font = { bold: true };

    info.columns[2].width = 90;
    info.columns[1].width = 50;
    info.columns[0].width = 20;
    return this;
  }

  addSheets() {
    const p1 = new Worksheet(this.workbook.addWorksheet('Pupil01'), {
      measureType: 'mean',
    });
    const p2 = new Worksheet(this.workbook.addWorksheet('Pupil02'), {
      measureType: 'min',
    });
    const p3 = new Worksheet(this.workbook.addWorksheet('Pupil03'), {
      measureType: 'max',
    });
    const p4 = new Worksheet(this.workbook.addWorksheet('Pupil04'), {
      measureType: 'baseline mean',
    });
    const p5 = new Worksheet(this.workbook.addWorksheet('Pupil05'), {
      measureType: 'baseline min',
    });
    const p6 = new Worksheet(this.workbook.addWorksheet('Pupil06'), {
      measureType: 'baseline max',
    });
    const p7 = new Worksheet(this.workbook.addWorksheet('Pupil07'), {
      measureType: 'divide baseline mean',
    });
    const p8 = new Worksheet(this.workbook.addWorksheet('Pupil08'), {
      measureType: 'divide baseline min',
    });
    const p9 = new Worksheet(this.workbook.addWorksheet('Pupil09'), {
      measureType: 'divide baseline max',
    });
    const p10 = new Worksheet(this.workbook.addWorksheet('Pupil10'), {
      measureType: 'z-score mean',
    });
    const p11 = new Worksheet(this.workbook.addWorksheet('Pupil11'), {
      measureType: 'z-score min',
    });
    const p12 = new Worksheet(this.workbook.addWorksheet('Pupil12'), {
      measureType: 'z-score max',
    });
    const p13 = new Worksheet(this.workbook.addWorksheet('Pupil13'), {
      measureType: 'z-score -baseline mean',
    });
    const p14 = new Worksheet(this.workbook.addWorksheet('Pupil14'), {
      measureType: 'z-score -baseline min',
    });
    const p15 = new Worksheet(this.workbook.addWorksheet('Pupil15'), {
      measureType: 'z-score -baseline max',
    });
    const p16 = new Worksheet(this.workbook.addWorksheet('Pupil16'), {
      measureType: 'z-score /baseline mean',
    });
    const p17 = new Worksheet(this.workbook.addWorksheet('Pupil17'), {
      measureType: 'z-score /baseline min',
    });
    const p18 = new Worksheet(this.workbook.addWorksheet('Pupil18'), {
      measureType: 'z-score /baseline max',
    });
    const p19 = new Worksheet(this.workbook.addWorksheet('Pupil19'), {
      measureType: 'relative mean',
    });
    const p20 = new Worksheet(this.workbook.addWorksheet('Pupil20'), {
      measureType: 'relative min',
    });
    const p21 = new Worksheet(this.workbook.addWorksheet('Pupil21'), {
      measureType: 'relative max',
    });
    const p22 = new Worksheet(this.workbook.addWorksheet('Pupil22'), {
      measureType: 'PCPD mean',
    });
    const p23 = new Worksheet(this.workbook.addWorksheet('Pupil23'), {
      measureType: 'PCPD min',
    });
    const p24 = new Worksheet(this.workbook.addWorksheet('Pupil24'), {
      measureType: 'PCPD max',
    });

    const metrics = [
      p1,
      p2,
      p3,
      p4,
      p5,
      p6,
      p7,
      p8,
      p9,
      p10,
      p11,
      p12,
      p13,
      p14,
      p15,
      p16,
      p17,
      p18,
      p19,
      p20,
      p21,
      p22,
      p23,
      p24,
    ];
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
