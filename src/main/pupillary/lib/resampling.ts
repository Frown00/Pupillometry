function getNextValid(samples: IPupilSample[]) {
  return function* generate() {
    for (let i = 0; i < samples.length; i += 1) {
      if (samples[i].mean) {
        yield samples[i];
      }
    }
  };
}

type Point = { x: number; y: number };

function interpolate(x: number, p1: Point, p2: Point) {
  return p1.y + ((x - p1.x) / (p2.x - p1.x)) * (p2.y - p1.y);
}

/**
 * Linear interpolation
 */
function upsampling(samples: IPupilSample[], sampleRate: number, gap = 0) {
  const step = 1000 / sampleRate;
  const getValid = getNextValid(samples)();
  const start = <IPupilSample>getValid.next().value;
  if (!start) return samples;
  const sampled = [{ ...start, timestamp: Math.round(start.timestamp) }];
  while (true) {
    const s1 = sampled[sampled.length - 1];
    const s2 = getValid.next().value;
    if (!s1 || !s2) break;

    const steps = (Math.round(s2.timestamp) - Math.round(s1.timestamp)) / step;
    const t1 = Math.round(s1.timestamp);
    const t2 = Math.round(s2.timestamp);
    const isGap = t2 - t1 > gap && gap > 0;
    for (let j = 1; j < steps; j += 1) {
      const x = Math.round(s1.timestamp) + j * step;
      const y = isGap
        ? NaN
        : interpolate(
            x,
            { x: t1, y: <number>s1.mean },
            { x: t2, y: <number>s2.mean }
          );
      const s: IPupilSample = {
        ...s1,
        segmentActive: s1.segmentActive,
        timestamp: x,
        mean: y,
        leftPupil: NaN,
        rightPupil: NaN,
        meanMark: 'upsampled',
      };
      sampled.push(s);
    }
    sampled.push({ ...s2, timestamp: t2, mean: isGap ? NaN : s2.mean });
  }
  return sampled;
}

/**
 * Bins
 */
function downsampling(samples: IPupilSample[], sampleRate: number) {
  const binDuration = 1000 / sampleRate;
  const sampled: IPupilSample[] = [];
  let bin: IPupilSample[] = [];
  let currentTime = binDuration;
  const sampleTemp: IPupilSample = {
    segmentActive: samples[0].segmentActive,
    timestamp: 0,
    leftPupil: NaN,
    rightPupil: NaN,
    meanMark: 'downsampled',
  };
  const calcMean = (binValues: number[]) => {
    const filtered = binValues.filter((b) => b > 0);
    return filtered.length
      ? filtered.reduce((c, v) => c + v, 0) / filtered.length
      : NaN;
  };
  for (let i = 0; i < samples.length; i += 1) {
    if (samples[i].timestamp <= currentTime) {
      bin.push(samples[i]);
    } else {
      const s: IPupilSample = {
        ...sampleTemp,
        timestamp: currentTime - binDuration,
        mean: calcMean(bin.map((b) => <number>b.mean)),
      };
      sampled.push(s);
      sampled.push(
        ...bin.map((b) => ({
          ...b,
          timestamp:
            b.timestamp === s.timestamp ? s.timestamp + 1 : b.timestamp,
          mean: s.mean,
        }))
      );
      bin = [samples[i]];
      currentTime += binDuration;
    }
  }
  sampled.push({
    ...sampleTemp,
    timestamp: currentTime - binDuration,
    mean: calcMean(bin.map((b) => <number>b.mean)),
  });
  return sampled;
}

export default function resampling(
  samples: IPupilSample[],
  params: {
    currentRate: number;
    wantedRate: number;
    interpolationGap: number;
  }
) {
  const sanitizedRate = Math.min(Math.max(1, params.wantedRate), 100000);
  if (params.currentRate === sanitizedRate) return samples;
  if (params.currentRate > sanitizedRate) {
    return downsampling(samples, sanitizedRate);
  }
  if (params.currentRate < sanitizedRate)
    return upsampling(samples, sanitizedRate, params.interpolationGap);
  return samples;
}
