import ExportMetrics from './ExportMetrics';

export default class ExportFasade {
  static async saveGroupedMetrics(
    study: IStudy,
    taskGroups: { [groupName: string]: ITaskGroup[] }
  ) {
    return new ExportMetrics(study, taskGroups).processAndSave();
  }
}
