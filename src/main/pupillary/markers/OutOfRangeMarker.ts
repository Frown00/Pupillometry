export default class OutOfRangeMarker implements IMarker {
  #min: number;

  #max: number;

  constructor(min: number, max: number) {
    this.#min = min;
    this.#max = max;
  }

  name = 'Out Of Range Marker';

  run(data: IPupilMarked[]): void {
    for (let i = 0; i < data.length; i += 1) {
      const sample = data[i];
      if (!sample.leftMark) this.tryMarkLeft(sample);
      if (!sample.rightMark) this.tryMarkRight(sample);
    }
  }

  private tryMarkLeft(sample: IPupilMarked) {
    if (!this.inRange(sample.leftPupil)) {
      if (!sample.leftMark) {
        sample.leftMark = {
          type: 'invalid',
        };
      }
    }
  }

  private tryMarkRight(sample: IPupilMarked) {
    if (!this.inRange(sample.rightPupil)) {
      if (!sample.rightMark) {
        sample.rightMark = {
          type: 'invalid',
        };
      }
    }
  }

  /**
   * Marks as NaN when sample is invalid
   * @param sample
   * @param min
   * @param max
   * @returns
   */
  private inRange(sample: number) {
    if (Number.isNaN(sample)) return false;
    if (sample < this.#min) return false;
    if (sample > this.#max) return false;
    return true;
  }
}
