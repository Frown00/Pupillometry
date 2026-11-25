import path from 'path';
import recommendedConfig from '../main/pupillary/configs/recommended.json';
import parser from '../main/pupillary/lib/parser';
import sampleLoader from '../main/pupillary/lib/sampleLoader';
import reference from './fixtures/analysis-fixtures/synthetic-scenes.reference.json';

const fixturePath = path.join(
  __dirname,
  'fixtures',
  'analysis-fixtures',
  reference.fixture
);
const fixtureConfig = {
  ...recommendedConfig,
  file: reference.config,
} as IConfig;

describe('ingestion parser', () => {
  test(
    'matches the reference, skips malformed timestamps, and preserves missing pupils as NaN',
    async () => {
      const { rawData } = await sampleLoader(fixturePath, fixtureConfig);
      const parsed = parser(rawData);
      const expected = reference.ingestion.parsedSamples.map((sample) => ({
        timestamp: sample.timestamp,
        leftPupil: sample.leftPupil === null ? NaN : sample.leftPupil,
        rightPupil: sample.rightPupil === null ? NaN : sample.rightPupil,
        segmentActive: sample.segmentActive,
      }));

      expect(rawData.map((sample) => sample.Timestamp)).toContain(
        'not-a-timestamp'
      );
      expect(parsed).toHaveLength(reference.ingestion.parsedRows);
      expect(parsed).toEqual(expected);
      expect(Number.isNaN(parsed[1].leftPupil)).toBe(true);
      expect(parsed[1].rightPupil).toBe(3.4);
    }
  );
});
