export default class TemporallyIsolatedMarker implements IMarker {
  private sizeMaximum: number;

  private isolationMinimum: number;

  constructor(sizeMaximum: number, isolationMinimum: number) {
    this.sizeMaximum = sizeMaximum;
    this.isolationMinimum = isolationMinimum;
  }

  name = 'Temporally Isolated Marker';

  // eslint-disable-next-line class-methods-use-this
  run(data: IPupilMarked[]): void {
    const temporalIsolationLeft = this.temporalIsolation('left');
    const temporalIsolationRight = this.temporalIsolation('right');
    for (let i = 0; i < data.length; i += 1) {
      const sample = data[i];
      temporalIsolationLeft(sample, Boolean(sample.leftMark));
      temporalIsolationRight(sample, Boolean(sample.rightMark));
    }
  }

  private temporalIsolation(eye: 'left' | 'right') {
    let potentialIsolated: IPupilMarked[] = [];
    const isolationMin = this.isolationMinimum;
    const sizeMax = this.sizeMaximum;
    const markFunction = eye === 'left' ? this.tryMarkLeft : this.tryMarkRight;
    let previousValidSample: IPupilMarked | null = null;
    return function isolation(sample: IPupilMarked, isMissing: boolean) {
      if (isMissing) return;
      const gap = sample.timestamp - (previousValidSample?.timestamp || 0);

      if (potentialIsolated.length === 0 && gap >= isolationMin) {
        potentialIsolated.push(sample);
      } else if (potentialIsolated.length > 0 && gap <= isolationMin) {
        potentialIsolated.push(sample);
      }
      if (potentialIsolated.length > 0) {
        const first = potentialIsolated[0];
        const last = potentialIsolated[potentialIsolated.length - 1];
        const islandSize = last.timestamp - first.timestamp;
        if (islandSize > sizeMax) {
          potentialIsolated = [];
        }
        if (gap > isolationMin) {
          potentialIsolated.map((s) => markFunction(s));
          potentialIsolated = [sample];
        }
      }
      previousValidSample = sample;
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private tryMarkLeft(sample: IPupilSample) {
    if (!sample) return;
    if (sample.leftMark) return;
    sample.leftMark = {
      type: 'outliers',
      algorithm: 'Temporal Isolated Island',
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private tryMarkRight(sample: IPupilSample) {
    if (!sample) return;
    if (sample.rightMark) return;
    sample.rightMark = {
      type: 'outliers',
      algorithm: 'Temporal Isolated Island',
    };
  }
}
