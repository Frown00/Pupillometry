/* eslint-disable import/prefer-default-export */
export function getAllTasks(respondents: IPupillometryResult[]) {
  const tasks = [];
  const respondent = respondents[0];
  for (let j = 0; j < respondent.segments.length; j += 1) {
    tasks.push(respondent.segments[j].name);
  }
  return tasks;
}

function numberToLetters(num: number) {
  let letters = '';
  while (num >= 0) {
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters;
    // eslint-disable-next-line no-param-reassign
    num = Math.floor(num / 26) - 1;
  }
  return letters;
}

export function mergeString(rowNum: number, from: number, to: number) {
  return `${numberToLetters(from)}${rowNum}:${numberToLetters(to)}${rowNum}`;
}
