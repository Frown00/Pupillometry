import fs from 'fs';
import os from 'os';
import path from 'path';
import testingConfigJson from '../../../pupillary/configs/just-testing.json';
import { State } from '../../../../ipc/interfaces';
import type { IPupillometryResponse } from '../../../../ipc/channels/PupillometryChannel';
import PupillometryRepository from '../PupillometryRepository';

describe('PupillometryRepository integration', () => {
  let temporaryDirectory: string;
  let csvPath: string;

  const config: IConfig = {
    ...(testingConfigJson as IConfig),
    markers: {
      ...(testingConfigJson as IConfig).markers,
      dilatationSpeed: {
        ...(testingConfigJson as IConfig).markers.dilatationSpeed,
        on: false,
      },
      trendlineDeviation: {
        ...(testingConfigJson as IConfig).markers.trendlineDeviation,
        on: false,
      },
      temporallyIsolatedSamples: {
        ...(testingConfigJson as IConfig).markers.temporallyIsolatedSamples,
        on: false,
      },
    },
    smoothing: {
      ...(testingConfigJson as IConfig).smoothing,
      on: false,
    },
    validity: {
      missing: 100,
      correlation: 0,
      difference: 10,
    },
  };

  beforeAll(() => {
    temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'pupillometry-repository-')
    );
    csvPath = path.join(temporaryDirectory, 'small-run.csv');
    fs.writeFileSync(
      csvPath,
      [
        '#DATA',
        'Timestamp,ET_PupilLeft,ET_PupilRight,Scene active',
        '0,3.0,3.1,Scene A',
        '100,3.2,3.3,Scene A',
        '200,3.4,3.5,Scene A',
        '300,3.1,3.2,Scene B',
        '400,3.3,3.4,Scene B',
        '500,3.5,3.6,Scene B',
        '',
      ].join('\n')
    );
  });

  afterAll(() => {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it('processes a small CSV and reports the existing loading update', async () => {
    const updates: IPupillometryResponse[] = [];

    const results = await PupillometryRepository.process(
      [csvPath],
      config,
      (response) => updates.push(response)
    );

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('small-run');
    expect(results[0].config).toBe(config.name);
    expect(results[0].segments.map(({ name }) => name)).toEqual([
      'Scene A',
      'Scene B',
    ]);
    expect(
      results[0].segments.map(({ stats }) => stats.sample.raw)
    ).toEqual([3, 3]);
    expect(
      results[0].segments.every(
        ({ samples, smoothed }) =>
          samples.length === 0 && smoothed?.length === 0
      )
    ).toBe(true);

    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({
      state: State.Loading,
      progress: 0,
    });
  });
});
