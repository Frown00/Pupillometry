import Store from '../Store';
import { removeElement } from '../../../util';

export interface IFile {
  path: string;
}

interface IRequestForm {
  studyName?: string;
  groupName?: string;
  respondentName?: string;
  files?: IFile[];
  isDependant?: boolean;
  config?: IConfig;
  respondentResults?: IPupillometryResult[];
}

export interface IStudyQuery {
  select?: Select;
  name?: string;
  group?: string;
  respondent?: string;
  form?: IRequestForm;
  results?: IPupillometryResult[];
}

type Select = 'study' | 'group' | 'respondent';

export default abstract class StudyRepository {
  private static createStudy(studies: IStudy[], studyName: string | undefined) {
    if (!studyName) throw new Error('No study name');
    if (studies.find((s) => s.name === studyName))
      throw new Error('Study must have unique name');
    const newStudy: IStudy = { name: studyName, groups: [] };
    studies.push(newStudy);
    Store.set('studies', studies);
    return newStudy;
  }

  private static createGroup(
    study: IStudy,
    form: {
      name?: string;
      isDependant?: boolean;
      config?: IConfig;
      files?: IFile[];
    }
  ) {
    const { name, isDependant, config, files } = form;
    if (!name) throw new Error('Group name is unknown');
    if (!isDependant) throw new Error('isDependant is unknown');
    if (!config) throw new Error('Config is unknown');
    if (!files) throw new Error('No files');
    const respondents: IPupillometryResult[] = [];
    const newGroup: IGroup = {
      name,
      isDependant,
      respondents,
    };
    study.groups.push(newGroup);
    return newGroup;
  }

  private static addRespondents(
    group: IGroup,
    results?: IPupillometryResult[],
    config?: IConfig
  ) {
    if (!config) throw new Error('Config is unknown');
    const respondents: IPupillometryResult[] = results ?? [];
    const withoutSamples = respondents.map((r) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const s of r.segments) {
        s.samples = [];
        s.smoothed = [];
      }
      return r;
    });
    group.respondents.push(...withoutSamples);
    return respondents;
  }

  static create(query: IStudyQuery) {
    const studies = <IStudy[]>Store.get('studies') ?? [];
    const { form } = query;
    if (query.select === 'study') {
      return StudyRepository.createStudy(studies, form?.studyName);
    }

    if (!query.name) throw new Error(`Study not selected`);
    const study = studies?.find((s) => s.name === query.name);
    if (!study) throw new Error(`Study ${query.name} does not exist`);
    if (!study.groups) study.groups = [];
    if (query.select === 'group') {
      const newGroup = StudyRepository.createGroup(study, {
        name: form?.groupName,
        ...form,
      });
      Store.set('studies', studies);
      return newGroup;
    }

    const group = study.groups?.find((g) => g.name === query.group);
    if (!group) throw new Error(`Group ${query.group} does not exist`);
    if (!group.respondents) group.respondents = [];
    if (query.select === 'respondent') {
      StudyRepository.addRespondents(group, query.results, form?.config);
      Store.set('studies', studies);
      return group;
    }
    return null;
  }

  static readOne(
    query: IStudyQuery
  ): IStudy | IGroup | IPupillometryResult | null {
    const studies = <IStudy[]>Store.get('studies');
    if (!query.name) return null;
    const study = studies?.find((s) => s.name === query.name);
    if (!study) return null;
    if (!query.group) return study;
    const group = study.groups.find((g) => g.name === query.group);
    if (!group) return null;
    if (!query.respondent) return group;
    const respondent = group.respondents.find(
      (r) => r.name === query.respondent
    );
    return respondent ?? null;
  }

  static readAll(
    query: IStudyQuery
  ): IStudy[] | IGroup[] | IPupillometryResult[] {
    const studies = <IStudy[]>Store.get('studies') ?? [];
    if (query.select === 'study') return studies;
    if (!query.name) return studies;

    const study = studies?.find((s) => s.name === query.name);
    if (!study) return [];
    if (query.select === 'group') return study.groups;
    if (!query.group) return study.groups;

    const group = study?.groups.find((g) => g.name === query.group);
    if (!group) return [];
    if (query.select === 'respondent') return group.respondents;
    if (!query.respondent) return group.respondents;
    return [];
  }

  static deleteOne(query: IStudyQuery) {
    const studies = <IStudy[]>Store.get('studies');
    if (!query.name) return null;
    if (!query.group) {
      const removed = removeElement(studies, 'name', query.name);
      Store.set('studies', studies);
      return removed;
    }
    const study = studies.find((s) => s.name === query.name);
    if (!study) return null;
    if (!query.respondent) {
      const removed = removeElement(study.groups, 'name', query.group);
      Store.set('studies', studies);
      return removed;
    }
    const group = study.groups.find((g) => g.name === query.group);
    if (!group) return null;
    const removed = removeElement(group.respondents, 'name', query.respondent);
    Store.set('studies', studies);
    return removed;
  }

  static clear() {
    Store.clear();
    return true;
  }
}
