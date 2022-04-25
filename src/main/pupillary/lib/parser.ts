export default function parser(
  rawSamples: IPupilSampleRaw[]
): IPupilSampleParsed[] {
  const parsed = [];
  for (let i = 0; i < rawSamples.length; i += 1) {
    if (i === rawSamples.length) break;
    const rowRaw = rawSamples[i];
    const row: IPupilSampleParsed = {
      leftPupil: Number(rowRaw.LeftPupil),
      rightPupil: Number(rowRaw.RightPupil),
      timestamp: Number(rowRaw.Timestamp),
      segmentActive: rowRaw.SegmentActive,
    };
    parsed.push(row);
  }
  return parsed;
}
