import ExportMetrics from './ExportMetrics';
import ExportSamples from './ExportSamples';

export default class ExportFasade {
  static async saveGroupedMetrics(
    study: IStudy,
    taskGroups: { [groupName: string]: ITaskGroup[] }
  ) {
    return new ExportMetrics(study, taskGroups).processAndSave();
  }

  static async saveSamples(study: IStudy) {
    return new ExportSamples(study).processAndSave();
  }
}
