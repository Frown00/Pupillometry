import path from 'path';
import neatCSV from 'neat-csv';
import loadData from '../../filesystem/loader';
import { PupilStandardHeaders } from '../constants';

interface ISampleLoader {
  name: string;
  rawData: IPupilSampleRaw[];
}
/**
 *
 * @param {string} filePath - system file path
 * @param {char} separator - character to seperate columns
 */
export default async function sampleLoader(
  filePath: string,
  config: IConfig
): Promise<ISampleLoader> {
  const { file } = config;
  const name = path.basename(filePath, '.csv');
  // const startingColumnMetadata = '#Data';
  const data = loadData(filePath, {
    encoding: 'utf-8',
    commentChar: '#',
    dataHeaderKeyword: 'DATA',
  });

  const pupilaryData: IPupilSampleRaw[] = await neatCSV(data, {
    separator: file.separator,
    mapHeaders: ({ header }) => {
      if (header === file.timestamp) return PupilStandardHeaders.TIMESTAMP;
      if (header === file.leftPupil) return PupilStandardHeaders.LEFT_PUPIL;
      if (header === file.rightPupil) return PupilStandardHeaders.RIGHT_PUPIL;
      if (header === file.segmentActive)
        return PupilStandardHeaders.SEGMENT_ACTIVE;
      return null;
    },
  });

  return {
    name,
    rawData: pupilaryData,
  };
}
