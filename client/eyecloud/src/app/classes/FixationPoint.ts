export class FixationPoint {
  private x: number;
  private y: number;
  private duration: string;
  private index: number;
  private timestamp: string;
  private user: string;
  constructor(index: number, x: number, y: number, duration: string, timestamp: string, user: string) {
    this.x = x;
    this.y = y;
    this.duration = duration;
    this.index = index;
    this.timestamp = timestamp;
    this.user = user;
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

  public getUser() {
    return this.user;
  }
}
