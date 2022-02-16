import { Routes } from '../../../constants';
import Table, { IRecord } from '../../molecules/Table';

export interface IStudyRecord {
  key: string;
  name: string;
  groups: number;
  respondents: number;
}

function createRecords(studies: IStudy[]) {
  const records: IStudyRecord[] = [];
  for (let i = 0; i < studies.length; i += 1) {
    const study = studies[i];
    const r: IStudyRecord = {
      key: i.toString(),
      name: study.name,
      groups: study.groups.length,
      respondents: study.groups.reduce(
        (prev, curr) => prev + curr.respondents.length,
        0
      ),
    };
    records.push(r);
  }
  return records as unknown as IRecord[];
}

interface IProps {
  studies: IStudy[];
  handleOnDelete: (record: any) => void;
}

export default function StudyTable(props: IProps) {
  const { studies, handleOnDelete } = props;
  const records = createRecords(studies);
  const size = 3;
  return (
    <Table
      baseRoute={Routes.Study('')}
      records={records}
      pageSize={size}
      handleOnDelete={handleOnDelete}
    />
  );
}
