export default function parser(
  rawSamples: IPupilSampleRaw[]
): IPupilSampleParsed[] {
  const parsed = [];
  for (let i = 0; i < rawSamples.length; i += 1) {
    const rowRaw = rawSamples[i];
    const timestamp = Number(rowRaw.Timestamp);
    if (!Number.isFinite(timestamp)) continue;
    const row: IPupilSampleParsed = {
      leftPupil: Number.isFinite(Number(rowRaw.LeftPupil))
        ? Number(rowRaw.LeftPupil)
        : NaN,
      rightPupil: Number.isFinite(Number(rowRaw.RightPupil))
        ? Number(rowRaw.RightPupil)
        : NaN,
      timestamp,
      segmentActive: rowRaw.SegmentActive,
    };
    parsed.push(row);
  }
  return parsed;
}
