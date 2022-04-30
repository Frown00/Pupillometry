import path from 'path';
import FileStore from '../../store/FileStore';
import FsUtil from '../../filesystem/FsUtil';
import MetricWorkbook from './MetricWorkbook';

export default class ExportMetrics {
  private study: IStudy;

  private taskGroups: { [groupName: string]: ITaskGroup[] };

  constructor(
    study: IStudy,
    taskGroups: { [groupName: string]: ITaskGroup[] }
  ) {
    this.study = study;
    this.taskGroups = taskGroups;
  }

  async processAndSave() {
    const dataPath = FileStore.getDataFolder(this.study.name);
    const exportDir = path.join(dataPath, '_export');
    FsUtil.createFolder(exportDir);
    const savePromises = [];
    for (let i = 0; i < this.study.groups.length; i += 1) {
      const group = this.study.groups[i];
      const taskGroups = this.taskGroups[group.name];
      savePromises.push(
        new MetricWorkbook(group, taskGroups)
          .addLegend()
          .addSheets()
          .save(exportDir)
      );
    }
    await Promise.all(savePromises);
    return exportDir;
  }
}
