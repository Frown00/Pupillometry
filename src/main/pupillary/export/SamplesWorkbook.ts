import path from 'path';
import ExcelJS from 'exceljs';

export default class SamplesWorkbook {
  private workbook: ExcelJS.Workbook;

  private respondent: IPupillometryResult;

  constructor(respondent: IPupillometryResult) {
    this.workbook = new ExcelJS.Workbook();
    this.respondent = respondent;
  }

  addSamples() {
    const worksheet = this.workbook.addWorksheet('Preprocessed Samples');
    worksheet.views[0] = {
      state: 'frozen',
      ySplit: 1,
    };
    worksheet.addRow(['TIMESTAMP', 'PUPIL']);
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });
    const { segments } = this.respondent;
    let timestamp = 0;
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      for (let s = 0; s < segment.samples.length; s += 1) {
        const sample = segment.samples[s];
        timestamp += sample.timestamp;
        worksheet.addRow([timestamp, sample.mean ? sample.mean : -1]);
      }
    }
    return this;
  }

  save(exportDir: string) {
    const fileName = `${this.respondent.name}.xlsx`;
    const p = path.join(exportDir, fileName);
    return this.workbook.xlsx.writeFile(p);
  }
}
