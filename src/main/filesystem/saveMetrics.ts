/* eslint-disable no-param-reassign */
import ExcelJS from 'exceljs';
import fs from 'fs';

function numberToLetters(num: number) {
  let letters = '';
  while (num >= 0) {
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters;
    num = Math.floor(num / 26) - 1;
  }
  return letters;
}

function mergeString(rowNum: number, from: number, to: number) {
  return `${numberToLetters(from)}${rowNum}:${numberToLetters(to)}${rowNum}`;
}

function getAllTasks(respondents: IPupillometryResult[]) {
  const tasks = [];
  const respondent = respondents[0];
  for (let j = 0; j < respondent.segments.length; j += 1) {
    tasks.push(respondent.segments[j].name);
  }
  return tasks;
}

function constructHeaders(tasks: string[]) {
  const taskColumns = 17;
  const header = ['Respondent'];
  for (let i = 0; i < tasks.length; i += 1) {
    const index = 1 + i * taskColumns;
    header[index] = tasks[i];
  }
  return header;
}

function constructSubHeaders(tasksLength: number) {
  const subHeader = [];
  const metrics = 5;
  const taskColumns = 17;
  for (let i = 0; i < tasksLength; i += 1) {
    subHeader[2 + i * taskColumns] = 'Valid';
    subHeader[3 + i * taskColumns] = 'PC';
    subHeader[4 + i * taskColumns] = 'Left';
    subHeader[4 + metrics + i * taskColumns] = 'Right';
    subHeader[4 + 2 * metrics + i * taskColumns] = 'Both';
  }
  return subHeader;
}

function mergeHeaderCells(worksheet: any, taskLength: number) {
  const taskColumns = 17;
  for (let i = 0; i < taskLength; i += 1) {
    const index = 1 + i * taskColumns;
    worksheet.mergeCells(mergeString(1, index, index + taskColumns - 1));
  }
}

function mergeSubHeaderCells(worksheet: any, taskLength: number) {
  const taskColumns = 17;
  const metrics = 5;
  for (let i = 0; i < taskLength; i += 1) {
    const leftIndex = 3 + i * taskColumns;
    const rightIndex = 3 + metrics + i * taskColumns;
    const bothIndex = 3 + 2 * metrics + i * taskColumns;
    worksheet.mergeCells(mergeString(2, leftIndex, leftIndex + metrics - 1)); // left
    worksheet.mergeCells(mergeString(2, rightIndex, rightIndex + metrics - 1)); // right
    worksheet.mergeCells(mergeString(2, bothIndex, bothIndex + metrics - 1)); // both
  }
}

function constructMetricHeaders(taskLength: number) {
  const metricsHeader = [];
  const metrics = 5;
  const taskColumns = 17;
  for (let t = 0; t < taskLength; t += 1) {
    const taskMove = t * taskColumns;
    for (let i = 0; i < 3; i += 1) {
      metricsHeader[4 + i * metrics + taskMove] = 'Min [mm]';
      metricsHeader[5 + i * metrics + taskMove] = 'Max [mm]';
      metricsHeader[6 + i * metrics + taskMove] = 'Mean [mm]';
      metricsHeader[7 + i * metrics + taskMove] = 'Std [mm]';
      metricsHeader[8 + i * metrics + taskMove] = 'Missing [%]';
    }
  }
  return metricsHeader;
}

export default async function saveMetrics(
  directoryPath: string,
  study: IStudy | undefined
) {
  if (!study) return null;
  if (!study.groups) return null;
  const workbook = new ExcelJS.Workbook();
  // freeze first row and column
  for (let i = 0; i < study.groups.length; i += 1) {
    const group = study.groups[i];
    const tasks = getAllTasks(group.respondents);
    // const respondent = group.respondents[0].segments.
    const worksheet = workbook.addWorksheet(
      `${group.name} ${group.isDependant ? 'dependant' : 'independant'}`,
      {
        views: [{ state: 'frozen', xSplit: 1, ySplit: 3 }],
      }
    );

    const header = constructHeaders(tasks);
    worksheet.addRow(header);
    worksheet.columns.forEach((column: any) => {
      if (!column.header?.length) column.width = 12;
      else column.width = column.header.length < 12 ? 12 : column.header.length;
    });
    mergeHeaderCells(worksheet, tasks.length);
    const subHeader = constructSubHeaders(tasks.length);
    worksheet.addRow(subHeader);
    mergeSubHeaderCells(worksheet, tasks.length);

    const metricsHeader = constructMetricHeaders(tasks.length);
    worksheet.addRow(metricsHeader);
    const eye = {
      left: 0,
      right: 1,
      both: 2,
    };
    const taskColumns = 17;
    const metrics = 5;
    const precision = 4;
    for (let r = 0; r < group.respondents.length; r += 1) {
      const respondent = group.respondents[r];
      const row: any[] = [respondent.name];
      for (let s = 0; s < respondent.segments.length; s += 1) {
        const segment = respondent.segments[s];
        const leftMove = eye.left * metrics + s * taskColumns;
        const righMove = eye.right * metrics + s * taskColumns;
        const bothMove = eye.both * metrics + s * taskColumns;
        const { stats } = segment;
        const { result, sample, left, right } = stats;
        const { min, max, mean, correlation, std, missing } = result;
        const { raw } = sample;

        row[1 + s * taskColumns] = segment?.classification ?? 'NO DATA';
        row[2 + s * taskColumns] = parseFloat(correlation?.toFixed(2) ?? -1);
        // left
        // both
        row[3 + leftMove] = parseFloat(left.min?.toFixed(precision) ?? -1);
        row[4 + leftMove] = parseFloat(left.max?.toFixed(precision) ?? -1);
        row[5 + leftMove] = parseFloat(left.mean?.toFixed(precision) ?? -1);
        row[6 + leftMove] = parseFloat(left.std?.toFixed(precision) ?? 1);
        row[7 + leftMove] = parseFloat(((left.missing / raw) * 100).toFixed(2));
        // right
        row[3 + righMove] = parseFloat(right.min?.toFixed(precision) ?? -1);
        row[4 + righMove] = parseFloat(right.max?.toFixed(precision) ?? -1);
        row[5 + righMove] = parseFloat(right.mean?.toFixed(precision) ?? -1);
        row[6 + righMove] = parseFloat(right.std?.toFixed(precision) ?? 1);
        row[7 + righMove] = parseFloat(
          ((right.missing / raw) * 100).toFixed(2)
        );
        // both
        row[3 + bothMove] = parseFloat(min?.toFixed(precision) ?? -1);
        row[4 + bothMove] = parseFloat(max?.toFixed(precision) ?? -1);
        row[5 + bothMove] = parseFloat(mean?.toFixed(precision) ?? -1);
        row[6 + bothMove] = parseFloat(std?.toFixed(precision) ?? 1);
        row[7 + bothMove] = parseFloat(((missing / raw) * 100).toFixed(2));
      }
      worksheet.addRow(row);
    }
  }

  const dir = `${directoryPath}/${study.name}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const fileName = `metics-${new Date().getTime()}`;
  await workbook.xlsx.writeFile(`${dir}/${fileName}.xlsx`);
  return dir;
}
