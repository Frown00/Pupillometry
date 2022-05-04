import { useRecoilState } from 'recoil';
import { activeGroupState, activeStudyState } from '../../../assets/state';
import { Routes } from '../../../routes';
import Table, { IRecord } from '../../molecules/Table';

export interface IRespondentRecord {
  key: string;
  name: string;
  validity: string;
  difference: number;
  correlation: number;
  missing: string;
  min: number;
  max: number;
  mean: number;
  std: number;
}

function getAllUniqueSegments(respondents: IPupillometryResult[]) {
  const segments: { [name: string]: IPupillometry } = {};
  for (let i = 0; i < respondents?.length; i += 1) {
    const r = respondents[i];
    r.segments.map((s) => {
      segments[s.name] = s;
      return true;
    });
  }
  return segments;
}

function createRecords(respondents: IPupillometryResult[]) {
  if (respondents.length === 0) return [];
  const records: any[] = [];
  let segmentRecords: any[] = [];
  const segments = getAllUniqueSegments(respondents);
  // eslint-disable-next-line no-restricted-syntax
  Object.keys(segments).forEach((key, idx) => {
    for (let r = 0; r < respondents.length; r += 1) {
      const respondent = respondents[r];
      let res: IRespondentRecord = {
        key: r.toString(),
        name: respondents[r].name,
        validity: 'NO DATA',
        correlation: -1,
        difference: -1,
        min: -1,
        max: -1,
        mean: -1,
        missing: '100%',
        std: -1,
      };
      if (!respondent.segments[idx]) {
        console.log('SOME WRONG', respondents[r].name);
        // eslint-disable-next-line no-continue
      } else {
        const { classification, stats } = respondents[r].segments[idx];

        res = {
          key: r.toString(),
          name: respondents[r].name,
          validity: classification,
          correlation: parseFloat(stats.sample.correlation?.toFixed(2)),
          missing: `${parseFloat(
            ((stats.sample.missing / stats.sample.raw) * 100)?.toFixed(2)
          )}%`,
          difference: parseFloat(stats.sample.difference?.toFixed(4)),
          min: parseFloat(stats.result.min?.toFixed(4)),
          max: parseFloat(stats.result.max?.toFixed(4)),
          mean: parseFloat(stats.result.mean?.toFixed(4)),
          std: parseFloat(stats.result.std?.toFixed(4)),
        };
      }
      segmentRecords.push(res);
    }
    records.push(segmentRecords);
    segmentRecords = [];
  });
  return records as unknown as IRecord[][];
}

interface IProps {
  respondents: IPupillometryResult[];
  segmentName: string;
  handleOnDelete: (record: any) => void;
}

export default function RespondentTable(props: IProps) {
  const { respondents, segmentName, handleOnDelete } = props;
  const [activeStudy] = useRecoilState(activeStudyState);
  const [activeGroup] = useRecoilState(activeGroupState);

  const records = createRecords(respondents);
  const baseRoute = `${Routes.Group(activeStudy.name, activeGroup.name)}/`;
  const size = 5;
  const allSegments = getAllUniqueSegments(respondents);
  const segmentId = Object.keys(allSegments).findIndex(
    (k) => k === segmentName
  );
  // const { meanGrand, stdGrand } = respondents[0];
  return (
    <Table
      baseRoute={baseRoute}
      records={records[segmentId]}
      pageSize={size}
      handleOnDelete={handleOnDelete}
    />
  );
}
