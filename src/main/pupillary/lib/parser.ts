function parseNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return NaN;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export default function parser(
  rawSamples: IPupilSampleRaw[]
): IPupilSampleParsed[] {
  const parsed: IPupilSampleParsed[] = [];
  rawSamples.forEach((rowRaw) => {
    const timestamp = parseNumber(rowRaw.Timestamp);
    if (!Number.isNaN(timestamp)) {
      parsed.push({
        leftPupil: parseNumber(rowRaw.LeftPupil),
        rightPupil: parseNumber(rowRaw.RightPupil),
        timestamp,
        segmentActive: rowRaw.SegmentActive,
      });
    }
  });
  return parsed;
}
