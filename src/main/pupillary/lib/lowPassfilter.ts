export default function lowPassFilter(
  samples: IPupilSample[],
  cutoff: number,
  sampleRate: number
): IPupilSample[] {
  const rc = 1.0 / (cutoff * 2 * Math.PI);
  const dt = 1.0 / sampleRate;
  const alpha = dt / (rc + dt);
  const result = [];
  const lastVal = samples.find((s) => s.mean && s.mean > 0) ?? {
    mean: 0,
    baselineDivide: 0,
    baselineSubstract: 0,
  };
  for (let i = 0; i < samples.length; i += 1) {
    if (samples[i].mean && !Number.isNaN(samples[i].mean)) {
      lastVal.mean =
        <number>lastVal.mean +
        alpha * (<number>samples[i].mean - <number>lastVal.mean);
      lastVal.baselineSubstract =
        <number>lastVal.baselineSubstract +
        alpha *
          (<number>samples[i].baselineSubstract -
            <number>lastVal.baselineSubstract);
      lastVal.baselineDivide =
        <number>lastVal.baselineDivide +
        alpha *
          (<number>samples[i].baselineDivide - <number>lastVal.baselineDivide);
      result[i] = {
        ...samples[i],
        mean: lastVal.mean,
        baselineSubstract: lastVal.baselineSubstract,
        baselineDivide: lastVal.baselineDivide,
      };
    } else {
      result[i] = {
        ...samples[i],
      };
    }
  }
  return result;
}
