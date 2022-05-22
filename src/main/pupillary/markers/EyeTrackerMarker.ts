/* eslint-disable class-methods-use-this */
export default class EyeTrackerMarker implements IMarker {
  name = 'Eye Tracker Marker';

  run(data: IPupilMarked[]) {
    for (let i = 0; i < data.length; i += 1) {
      const sample = data[i];
      if (!sample.leftMark) this.tryMarkLeft(sample);
      if (!sample.rightMark) this.tryMarkRight(sample);
    }
    return this;
  }

  private tryMarkLeft(sample: IPupilMarked) {
    if (!this.isETMarkedAsCorrect(sample.leftPupil)) {
      if (!sample.leftMark) {
        sample.leftMark = {
          type: 'missing',
        };
      }
    }
  }

  private tryMarkRight(sample: IPupilMarked) {
    if (!this.isETMarkedAsCorrect(sample.rightPupil)) {
      if (!sample.rightMark) {
        sample.rightMark = {
          type: 'missing',
        };
      }
    }
  }

  private isETMarkedAsCorrect(sample: number) {
    if (Number.isNaN(sample)) return false;
    if (!sample.toString().trim()) return false;
    if (sample <= 0) return false;
    return true;
  }
}
