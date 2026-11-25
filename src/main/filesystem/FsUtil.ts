import fs from 'fs';
import path from 'path';
import log from 'electron-log';

export default class FsUtil {
  static createFolder(folderPath: string) {
    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
        log.info('Folder created', path.basename(folderPath));
      }
    } catch {
      throw new Error(`Unable to create folder located in ${folderPath}`);
    }
  }

  static removeFolder(folderPath: string) {
    if (!folderPath) {
      throw new Error(`No folder path ${folderPath}`);
    }
    try {
      fs.rmdirSync(folderPath, { recursive: true });
      log.info('Folder removed', path.basename(folderPath));
    } catch {
      throw new Error(`Wrong folder path ${folderPath}`);
    }
  }

  static createFile(filePath: string, data: string | NodeJS.ArrayBufferView) {
    try {
      // const content = JSON.stringify(data);
      fs.writeFile(filePath, data, (err) => {
        if (err) throw new Error(`Cannot save file ${err}`);
        log.info('File created', path.basename(filePath));
        return true;
      });
    } catch (err) {
      throw new Error(`Cannot process data ${err}`);
    }
    return true;
  }

  static readFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return data;
    } catch (err) {
      throw new Error(`Cannot read data ${err}`);
    }
  }

  static removeFile(filePath: string) {
    fs.unlink(filePath, (err) => {
      if (err) {
        throw new Error(`Remove file failed ${filePath}`);
      }
      log.info('File removed', path.basename(filePath));
    });
  }
}
