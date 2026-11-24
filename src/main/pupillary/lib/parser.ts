function parseNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return NaN;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export default function parser(
  rawSamples: IPupilSampleRaw[]
): IPupilSampleParsed[] {
  const parsed = [];
  for (let i = 0; i < rawSamples.length; i += 1) {
    const rowRaw = rawSamples[i];
    const timestamp = parseNumber(rowRaw.Timestamp);
    if (Number.isNaN(timestamp)) continue;
    const row: IPupilSampleParsed = {
      leftPupil: parseNumber(rowRaw.LeftPupil),
      rightPupil: parseNumber(rowRaw.RightPupil),
      timestamp,
      segmentActive: rowRaw.SegmentActive,
    };
    parsed.push(row);
  }
  return parsed;
}
