export default function lowPassFilter(
  samples: IPupilSample[],
  cutoff: number,
  sampleRate: number
): IPupilSample[] {
  const rc = 1.0 / (cutoff * 2 * Math.PI);
  const dt = 1.0 / sampleRate;
  const alpha = dt / (rc + dt);
  const result = [];
  let lastVal = samples.find((s) => s.mean && s.mean > 0)?.mean ?? 0;
  for (let i = 0; i < samples.length; i += 1) {
    if (samples[i].mean && !Number.isNaN(samples[i].mean)) {
      lastVal += alpha * (<number>samples[i].mean - lastVal);
      result[i] = {
        ...samples[i],
        mean: lastVal,
      };
    } else {
      result[i] = {
        ...samples[i],
      };
    }
  }
  return result;
}
