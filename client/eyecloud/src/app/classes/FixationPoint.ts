export class FixationPoint {
  private x: number;
  private y: number;
  private duration: string;
  private index: number;
  private timestamp: string;
  constructor(index: number, x: number, y: number, duration: string, timestamp: string) {
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

  public getTimestamp() {
    return this.timestamp;
  }
}
