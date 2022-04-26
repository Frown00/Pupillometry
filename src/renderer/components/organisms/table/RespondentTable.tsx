import { useRecoilState } from 'recoil';
import { activeGroupState, activeStudyState } from '../../../assets/state';
import { Routes } from '../../../routes';
import Table, { IRecord } from '../../molecules/Table';

export interface IRespondentRecord {
  key: string;
  name: string;
  validity: string;
  pupilCorrelation: number;
  missing: number;
  min: number;
  max: number;
  mean: number;
  std: number;
}

function createRecords(respondents: IPupillometryResult[]) {
  if (respondents.length === 0) return [];
  const records = [];
  let segmentRecords = [];
  const segments = respondents[0].segments.length;
  for (let s = 0; s < segments; s += 1) {
    for (let r = 0; r < respondents.length; r += 1) {
      let res: IRespondentRecord = {
        key: r.toString(),
        name: respondents[r].name,
        validity: 'NO DATA',
        pupilCorrelation: -1,
        min: -1,
        max: -1,
        mean: -1,
        missing: 100,
        std: -1,
      };
      if (!respondents?.[r]?.segments?.[s]) {
        console.log('SOME WRONG', respondents[r].name, s);
        // eslint-disable-next-line no-continue
      } else {
        const { classification, stats } = respondents[r].segments[s];

        res = {
          key: r.toString(),
          name: respondents[r].name,
          validity: classification,
          pupilCorrelation: parseFloat(stats.result.correlation?.toFixed(2)),
          min: parseFloat(stats.result.min?.toFixed(4)),
          max: parseFloat(stats.result.max?.toFixed(4)),
          mean: parseFloat(stats.result.mean?.toFixed(4)),
          missing: parseFloat(
            ((stats.result.missing / stats.sample.raw) * 100)?.toFixed(2)
          ),
          std: parseFloat(stats.result.std?.toFixed(4)),
        };
      }
      segmentRecords.push(res);
    }
    records.push(segmentRecords);
    segmentRecords = [];
  }
  return records as unknown as IRecord[][];
}

interface IProps {
  respondents: IPupillometryResult[];
  handleOnDelete: (record: any) => void;
}

export default function RespondentTable(props: IProps) {
  const { respondents, handleOnDelete } = props;
  const [activeStudy] = useRecoilState(activeStudyState);
  const [activeGroup] = useRecoilState(activeGroupState);

  const records = createRecords(respondents);
  const baseRoute = `${Routes.Group(activeStudy.name, activeGroup.name)}/`;
  const size = 5;
  return (
    <Table
      baseRoute={baseRoute}
      records={records[0]}
      pageSize={size}
      handleOnDelete={handleOnDelete}
    />
  );
}
