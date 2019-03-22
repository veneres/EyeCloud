export class AggregatedFixationPoint {

  private xCoord: number;
  private yCoord: number;
  private duration: number;
  private numPoints: number;

  constructor(xCoord: number, yCoord: number, duration: number) {
    this.xCoord = xCoord;
    this.yCoord = yCoord;
    this.duration = duration;
    this.numPoints = 1;
  }

  public getX() {
    return this.xCoord;
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
}
