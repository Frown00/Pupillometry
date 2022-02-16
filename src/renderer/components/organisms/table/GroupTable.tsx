import { Routes } from '../../../constants';
import Table, { IRecord } from '../../molecules/Table';

export interface IGroupRecord {
  key: string;
  name: string;
  respondents: number;
}

function createRecords(groups: IGroup[]) {
  const records = [];
  for (let i = 0; i < groups.length; i += 1) {
    const group = groups[i];
    const r: IGroupRecord = {
      key: i.toString(),
      name: group.name,
      respondents: group.respondents.length,
    };
    records.push(r);
  }
  return records as unknown as IRecord[];
}

interface IProps {
  studyName: string;
  groups: IGroup[];
  handleOnDelete: (record: any) => void;
}

export default function GroupTable(props: IProps) {
  const { studyName, groups, handleOnDelete } = props;
  const records = createRecords(groups);
  const baseRoute = `${Routes.Study(studyName)}/`;
  const size = 5;
  return (
    <Table
      baseRoute={baseRoute}
      records={records}
      pageSize={size}
      handleOnDelete={handleOnDelete}
    />
  );
}
