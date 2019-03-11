export class FixationPoint {
  private x: number;
  private y: number;
  private duration: number;
  private index: number;
  private timestamp: number;
  constructor(index: number, x: number, y: number, duration: number, timestamp: number) {
    this.x = x;
    this.y = y;
    this.duration = duration;
    this.index = index;
    this.timestamp = timestamp;
  }
  public getX() {
    return this.x;
  }

  public getY() {
    return this.y;
  }

  public getDuration() {
    return this.duration;
  }
}
