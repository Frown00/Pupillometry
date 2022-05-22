import Segment from '../Segment';

type SegmentationType = 'No' | 'Window' | 'By Scene';

function timeWindows(samples: IPupilSampleParsed[], config: IConfig) {
  const { measurement } = config;
  const segments: Segment[] = [];
  const { windows } = measurement;

  if (!windows) throw Error('No passed time windows');
  for (let w = 0; w < windows.length; w += 1) {
    const fragment = windows[w].split(',');
    const name = fragment?.[0] ?? 'Some name';
    const start = Number(fragment?.[1]) ?? 0;
    const end = Number(fragment?.[2]) ?? 1000;
    const data = [];
    for (let i = 0; i < samples.length; i += 1) {
      if (samples[i].timestamp >= end) break;
      if (samples[i].timestamp >= start) {
        samples[i].timestamp -= start;
        data.push(samples[i]);
      }
    }
    segments.push(new Segment(name, data));
  }
  return segments;
}

function byScene(samples: IPupilSampleParsed[]) {
  let currentSegment: { raw: IPupilSampleParsed[]; name: string } = {
    raw: [],
    name: '',
  };
  let startTimestamp = 0;
  const segments: Segment[] = [];
  for (let i = 0; i < samples.length; i += 1) {
    const row = samples[i];
    const segmentActive = row.segmentActive?.trim() || '';
    // Remove transitions
    const splitted = segmentActive.split(';');
    if (segmentActive && splitted.length === 1) {
      // Starting
      if (currentSegment.name === '') {
        currentSegment.name = segmentActive;
        startTimestamp = row.timestamp;
      }
      // Push data to segment
      if (currentSegment.name === segmentActive) {
        currentSegment.name = segmentActive;
        row.timestamp -= startTimestamp;
        currentSegment.raw.push(row);
      } else {
        // Ending segment
        if (currentSegment.raw.length > 0)
          segments.push(new Segment(currentSegment.name, currentSegment.raw));
        // start new and push
        currentSegment = { raw: [], name: '' };
        currentSegment.name = segmentActive;
        startTimestamp = row.timestamp;
        row.timestamp -= startTimestamp;
        currentSegment.raw.push(row);
      }
    }
  }
  segments.push(new Segment(currentSegment.name, currentSegment.raw));
  return segments;
}

function getType(config: IConfig): SegmentationType {
  const { measurement } = config;
  if (measurement.segmentation === 'time windows') return 'Window';
  if (measurement.segmentation === 'scene') return 'By Scene';
  return 'No';
}

export default function segmentation(
  data: IPupilSampleParsed[],
  config: IConfig
) {
  const type = getType(config);
  if (type === 'No') return [new Segment('Entire Study', data)];
  if (type === 'By Scene') return byScene(data);
  if (type === 'Window') return timeWindows(data, config);
  throw new Error('Something went wrong during segmentation');
}
