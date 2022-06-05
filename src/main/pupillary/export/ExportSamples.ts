import path from 'path';
import FileStore from '../../store/FileStore';
import FsUtil from '../../filesystem/FsUtil';
import SamplesWorkbook from './SamplesWorkbook';

export default class ExportSamples {
  private study: IStudy;

  constructor(study: IStudy) {
    this.study = study;
  }

  async processAndSave() {
    const studyPath = FileStore.getDataFolder(this.study.name);
    const exportDirBase = path.join(studyPath, '_samples');
    const savePromises = [];
    for (let g = 0; g < this.study.groups.length; g += 1) {
      const group = this.study.groups[g];
      const exportDir = path.join(exportDirBase, group.name);
      FsUtil.createFolder(exportDir);

      for (let r = 0; r < group.respondents.length; r += 1) {
        const respondent = group.respondents[r];
        const data = <IPupillometryResult>(
          FileStore.readFile(respondent.dataPath)
        );
        savePromises.push(
          new SamplesWorkbook(data).addSamples().save(exportDir)
        );
      }
    }
    await Promise.all(savePromises);
    return exportDirBase;
  }
}
