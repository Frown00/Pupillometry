import neatCSV from 'neat-csv';
import loadData from '../filesystem/loader';

import * as pupil from './constants';

/**
 *
 * @param {string} filePath - system file path
 * @param {char} separator - character to seperate columns
 * @returns {Promise<neatCSV.Row[]>}
 */
export default async function getPupillary(filePath: string, separator = ',') {
  const data = loadData(filePath, {
    encoding: 'utf-8',
    commentChar: '#',
    dataHeaderKeyword: 'DATA',
  });
  const pupilaryData = await neatCSV(data, {
    separator,
    mapHeaders: ({ header }) => {
      if (pupil.headers.includes(header)) {
        return header;
      }
      return null;
    },
  });
  return pupilaryData;
}
