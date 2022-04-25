export default function lowPassFilter(
  samples: IPupilSample[],
  cutoff: number,
  sampleRate: number,
  numChannels = 1
): IPupilSample[] {
  const rc = 1.0 / (cutoff * 2 * Math.PI);
  const dt = 1.0 / sampleRate;
  const alpha = dt / (rc + dt);
  const lastVal = [];
  const result = [];
  let offset;
  for (let i = 0; i < numChannels; i += 1) {
    lastVal.push({ ...samples[i] });
  }
  for (let i = 0; i < samples.length; i += 1) {
    for (let j = 0; j < numChannels; j += 1) {
      offset = i + j;

      if (
        samples[offset].mean &&
        lastVal[j].mean &&
        !Number.isNaN(samples[offset].mean)
      ) {
        lastVal[j].mean =
          <number>lastVal[j].mean +
          alpha * (<number>samples[offset].mean - <number>lastVal[j].mean);
        result[offset] = {
          ...lastVal[j],
          timestamp: samples[offset].timestamp,
        };
      }
    }
  }
  return result;
}
