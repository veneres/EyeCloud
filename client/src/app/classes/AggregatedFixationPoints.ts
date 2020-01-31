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
    this.timestamps = [timestamps];
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

  public getBinsOfTimestamps(binSize: number) {
    const bins = {};
    let numBins = Math.floor(Math.max(...this.timestamps) / binSize);
    this.timestamps.forEach(timestamp => {
      let binIndex = Math.ceil(timestamp / binSize);
      if (binIndex in bins) {
        bins[binIndex].push(timestamp);
      } else {
        bins[binIndex] = [timestamp];
      }
    });
    return bins;
  }

  public getModeTimestamp(binSize: number): number {
    const bins = this.getBinsOfTimestamps(binSize);
    // count the number of items in each bin
    let targetBinIndex = "0";
    for (let key in bins) {
      if (!(targetBinIndex in bins) || bins[key].length > bins[targetBinIndex].length) {
        targetBinIndex = key;
      }
    }
    // take the average of all timestamps in the bin
    const average = arr => Math.round(arr.reduce((a,b) => a + b, 0) / arr.length);
    return average(bins[targetBinIndex]);
  }
}
