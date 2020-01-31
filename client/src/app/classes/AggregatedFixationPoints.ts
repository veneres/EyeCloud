export class AggregatedFixationPoint {

  private xCoord: number;
  private yCoord: number;
  private duration: number;
  private numPoints: number;
  private timestamps: number[];

  constructor(xCoord: number, yCoord: number, duration: number, timestamps: number) {
    this.xCoord = xCoord;
    this.yCoord = yCoord;
    this.duration = duration;
    this.numPoints = 1;
    this.timestamps = [];
    this.timestamps.push(timestamps);
  }

  public getX() {
    return this.xCoord;
  }

  public getTimestamps(){
    return this.timestamps;
  }

  public getY() {
    return this.yCoord;
  }

  public getNumPoints() {
    return this.numPoints;
  }

  public getDuration() {
    return this.duration;
  }

  public setX(xCoord: number) {
    this.xCoord = xCoord;
  }

  public setY(yCoord: number) {
    this.yCoord = yCoord;
  }

  public incrementNumPoints() {
    this.numPoints++;
  }

  public incrementDuration(duration: number) {
    this.duration += duration;
  }

  public addTimestamp(timestamp: number) {
    this.timestamps.push(timestamp);
  }

  public getModeTimestamp(): number {
    let mode = {};
    let max = 0, count = 0;

    this.timestamps.forEach(
      function(e) {
        if (mode[e]) { mode[e]++; }
        else { mode[e] = 1; }

        if (count < mode[e]) {
          max = e;
          count = mode[e];
        }
      });

    return max;
  }
}
