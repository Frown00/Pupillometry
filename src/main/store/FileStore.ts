import path from 'path';
import fs from 'fs';
import FsUtil from '../filesystem/FsUtil';

interface IFileStoreConfig {
  data: {
    location: string;
  };
}

export default class FileStore {
  private static instance: FileStore;

  private static config: IFileStoreConfig;

  constructor(config: IFileStoreConfig) {
    if (FileStore.instance) {
      return FileStore.instance;
    }
    FileStore.config = config;
    FileStore.instance = this;
  }

  static getDataFolder(studyName?: string, groupName?: string) {
    const { data } = FileStore.config;
    let dataPath = data.location;
    FsUtil.createFolder(dataPath);
    if (studyName) {
      dataPath = path.join(dataPath, studyName);
      FsUtil.createFolder(dataPath);
    }
    if (groupName) {
      dataPath = path.join(dataPath, groupName);
      FsUtil.createFolder(dataPath);
    }
    return dataPath;
  }

  static getFilePath(
    studyName: string,
    groupName: string,
    respondentName: string
  ) {
    const { data } = FileStore.config;
    return path.join(data.location, studyName, groupName, respondentName);
  }

  static createStudyFolder(name: string) {
    const { data } = FileStore.config;
    const folderPath = `${data.location}/${name}`;
    try {
      FsUtil.createFolder(folderPath);
    } catch (err) {
      throw new Error(`Cannot create study folder: ${err}`);
    }
  }

  static createGroupFolder(studyName: string, groupName: string) {
    const { data } = FileStore.config;
    const folderPath = `${data.location}/${studyName}/${groupName}`;
    try {
      FsUtil.createFolder(folderPath);
    } catch (err) {
      throw new Error(`Cannot create group folder: ${err}`);
    }
  }

  static removeStudy(name: string) {
    const { data } = FileStore.config;
    const folderPath = `${data.location}/${name}`;
    FsUtil.removeFolder(folderPath);
  }

  static removeGroup(studyName: string, groupName: string) {
    const { data } = FileStore.config;
    const folderPath = `${data.location}/${studyName}/${groupName}`;
    FsUtil.removeFolder(folderPath);
  }

  static removeAll() {
    const { data } = FileStore.config;
    const folderPath = `${data.location}`;
    FsUtil.removeFolder(folderPath);
  }

  static removeRespondent(
    studyName: string,
    groupName: string,
    respondentName: string
  ) {
    const { data } = FileStore.config;
    const filePath = `${data.location}/${studyName}/${groupName}/${respondentName}`;
    FsUtil.removeFile(filePath);
  }

  static saveFile(data: IPupillometryResult, dataPath: string) {
    try {
      const toSave = JSON.stringify(data);
      FsUtil.createFile(path.join(dataPath, data.name), toSave);
    } catch (err) {
      throw new Error(`${err}`);
    }
  }

  static readFile(dataPath: string) {
    try {
      const data = FsUtil.readFile(dataPath);
      if (data) return JSON.parse(data);
      return false;
    } catch (err) {
      throw new Error(`${err}`);
    }
  }
}
