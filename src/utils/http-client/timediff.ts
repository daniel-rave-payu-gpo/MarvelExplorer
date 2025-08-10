export default class TimeDiff {
  private startTime = new Date();
  public static startMeasurement() {
    return new TimeDiff();
  }
  public getTimeSinceStart() {
    return new Date().getTime() - this.startTime.getTime();
  }
}
