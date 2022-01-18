/* eslint-disable promise/no-nesting */
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import neatCSV from 'neat-csv';
import path from 'path';
import { Channel } from '../../ipc/channels';
import loadData from '../filesystem/loader';
import { PupilStandardHeaders } from './constants';
import Preprocessing from './PreProcessing';
/**
 *
 * @param {string} filePath - system file path
 * @param {char} separator - character to seperate columns
 * @returns {Promise<neatCSV.Row[]>}
 */
export async function processPupilSamples(filePath: string, config: IConfig) {
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

  const preProcessing = new Preprocessing(pupilaryData, config);
  const segments = preProcessing.process();
  return {
    name,
    segments,
    config: config.name,
    dataPath: '',
  };
}

export default function listenEvents(mainWindow: BrowserWindow) {
  ipcMain.on(
    Channel.ProcessPupil,
    (e: Electron.IpcMainEvent, config: IConfig) => {
      try {
        // eslint-disable-next-line promise/catch-or-return
        dialog
          .showOpenDialog(mainWindow, {
            buttonLabel: 'Select a pupillometry file',
            properties: ['multiSelections', 'createDirectory', 'openFile'],
          })
          .then(async (result: any) => {
            const respondent: IRespondentSamples = await processPupilSamples(
              result.filePaths[0],
              config
            );
            console.log(
              'Proccessed:',
              respondent.segments.reduce(
                (prev, curr) => prev + curr.stats.rawSamplesCount,
                0
              )
            );
            e.sender.send(Channel.GetValidPupilSamples, respondent);
            return result;
          });
      } catch (err) {
        throw new Error();
      }
    }
  );
}
