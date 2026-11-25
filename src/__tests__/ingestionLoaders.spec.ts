import fs from 'fs';
import path from 'path';
import loadData from '../main/filesystem/loader';
import recommendedConfig from '../main/pupillary/configs/recommended.json';
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

describe('ingestion loaders', () => {
  test('file loader starts at the DATA headers and preserves fixture rows', () => {
    const csv = fs.readFileSync(fixturePath, 'utf-8');
    const dataStart = csv.indexOf('Row,Timestamp,');

    expect(dataStart).toBeGreaterThan(0);
    expect(
      loadData(fixturePath, {
        encoding: 'utf-8',
        commentChar: '#',
        dataHeaderKeyword: 'DATA',
      })
    ).toBe(csv.substring(dataStart));
  });

  test('sample loader maps configured CSV headers and retains raw rows', async () => {
    const { name, rawData } = await sampleLoader(
      fixturePath,
      fixtureConfig
    );

    expect(name).toBe('synthetic-scenes');
    expect(rawData).toHaveLength(reference.ingestion.rawRows);
    expect(Object.keys(rawData[0])).toEqual([
      'Timestamp',
      'LeftPupil',
      'RightPupil',
      'SegmentActive',
    ]);
    expect(rawData[0]).toEqual({
      Timestamp: '1000',
      LeftPupil: '3.0',
      RightPupil: '3.2',
      SegmentActive: 'Fixation',
    });
    expect(rawData[1].LeftPupil).toBe('');
    expect(rawData[3].Timestamp).toBe('not-a-timestamp');
  });
});
