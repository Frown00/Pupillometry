/* eslint-disable import/prefer-default-export */
import { atom } from 'recoil';

export const studiesState = atom({
  key: 'studies',
  default: [] as IStudy[],
});

export const activeStudyState = atom({
  key: 'activeStudy',
  default: {} as IStudy,
});

export const activeGroupState = atom({
  key: 'activeGroup',
  default: {} as IGroup,
});

export const configsState = atom({
  key: 'configs',
  default: {} as IConfigMap,
});

export const taskGroupsState = atom({
  key: 'taskGroups',
  default: {} as { [groupName: string]: ITaskGroup[] },
});
