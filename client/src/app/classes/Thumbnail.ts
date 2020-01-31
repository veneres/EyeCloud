import {AggregatedFixationPoint} from './AggregatedFixationPoints';

export class Thumbnail {

  private static startX = 200;
  private static startY = 200;
  private static numPointsPerCircle = 5;
  private readonly fixationPoint: AggregatedFixationPoint;
  selected = false;
  id: number;
  croppingSize: number;
  styleX: number;
  styleY: number;
  positionX: number;
  positionY: number;
  fixationDuration: number;
  modeTimestamp: number;
  strokeColor: string;

  constructor(id: number, fixationPoint: AggregatedFixationPoint, croppingSize: number,
              positionX: number, positionY: number) {
    this.id = id; // unique, unchangeable value
    this.fixationPoint = fixationPoint; // should not be null, and must be input upon creation of thumbnail
    // specify data associated with fixation point
    this.styleX = this.fixationPoint.getX();
    this.styleY = this.fixationPoint.getY();
    this.fixationDuration = fixationPoint.getDuration();
    this.modeTimestamp = fixationPoint.getModeTimestamp(1000);
    // modifiable data associated with thumbnail
    this.croppingSize = croppingSize;
    this.positionX = positionX;
    this.positionY = positionY;
    // color initialized to hex code of "dark gray"
    this.strokeColor = "#3a3a3a";
  }

  public updateThumbnailData(croppingSize: number, positionX: number, positionY: number) {
    this.croppingSize = croppingSize;
    this.positionX = positionX;
    this.positionY = positionY;
  }

  public getFixationDuration(): number {
    return this.fixationDuration;
  }

  public getModeTimestamp(): number {
    return this.modeTimestamp;
  }

  public getAggregatedFixationPoint(){
    return this.fixationPoint;
  }

  public getX(){
    return this.styleX;
  }

  public getY(){
    return this.styleY;
  }

  public getCroppingSize(){
    return this.croppingSize;
  }

  public getStrokeColor(){
    return this.strokeColor;
  }

  public updateColor(color : string){
    this.strokeColor = color;
  }

  public static get_thumbnails_for_attention_cloud(fixationPoints: AggregatedFixationPoint[],
                                                   maxCroppingSize: number, minCroppingSize: number,
                                                   maxDisplayPoints: number) {
    const thumbnails = [];
    const sortedFixationPoints = fixationPoints.sort(compareFixationDuration);
    // initialize thumbnail array with unsorted fixation points
    for (let i = 0; i < Math.min(maxDisplayPoints, sortedFixationPoints.length); i++) {
      thumbnails.push(new Thumbnail(i, sortedFixationPoints[i], 0,  0, 0));
    }

    // update thumbnails' data
    const maxDuration = thumbnails[0].getFixationDuration();
    let counter = 0;
    thumbnails.forEach(thumbnail => {
      let size = thumbnail.getFixationDuration() / maxDuration * maxCroppingSize;
      if (size < minCroppingSize) { size = minCroppingSize; }
      if (size > maxCroppingSize) { size = maxCroppingSize; }
      const multiplier = Math.floor(counter / this.numPointsPerCircle) + 1;
      const radius = maxCroppingSize * multiplier;
      const degree = 360 / (this.numPointsPerCircle * multiplier) * (counter % this.numPointsPerCircle + 1);
      const posX = this.startX + radius * Math.cos(degree * Math.PI / 180);
      const posY = this.startY + radius * Math.sin(degree * Math.PI / 180);
      thumbnail.updateThumbnailData(size, posX, posY);
      counter++;
    });

    // sort by timestamp and update stroke color
    const sortedThumbnailsByTimestamp = this.sortThumbnailsByTimestamp(thumbnails);
    for (let i = 0; i < sortedThumbnailsByTimestamp.length; i++) {
      let ratio = i / sortedThumbnailsByTimestamp.length;
      sortedThumbnailsByTimestamp[i].updateColor(this.convertIdToColor(ratio));
    }

    // return sorted thumbnails by duration
    return this.sortThumbnailsByTimestamp(sortedThumbnailsByTimestamp);
  }

  public static sortThumbnailsByTimestamp(thumbnails: Thumbnail[]) {
    // sort thumbnails according to mode timestamp
    thumbnails.sort(compareThumbnailTimestamp);
    return thumbnails;
  }

  public static sortThumbnailsByDuration(thumbnails: Thumbnail[]) {
    // sort thumbnails according to duration
    thumbnails.sort(compareThumbnailDuration);
    return thumbnails;
  }

  public static convertIdToColor(ratio : number) {
    const rgbToHex = function (rgb) {
      let hex = Number(rgb).toString(16);
      if (hex.length < 2) {
        hex = "0" + hex;
      }
      return hex;
    };

    const fullColorHex = function(r, g, b) {
      let red = rgbToHex(r);
      let green = rgbToHex(g);
      let blue = rgbToHex(b);
      return red + green + blue;
    };

    let red = 0, green = 0, blue = 0;
    // 3 quadrants: (255, 0, 0) -> (128, 0, 255) -> (0, 255, 255) -> (128, 255, 0)
    if (ratio >= 0 && ratio < 0.3) {
      red = (1 - ratio / 0.3) * (255 - 128) + 128;
      green = 0;
      blue = (ratio / 0.3) * 255;
    }
    else if (ratio >= 0.3 && ratio < 0.65) {
      red = (1 - (ratio - 0.3) / 0.35) * 128;
      green = (ratio - 0.3) / 0.35 * 255;
      blue = 255;
    }
    else if (ratio >= 0.65 && ratio <= 1) {
      red = (ratio - 0.65) / 0.35 * 128;
      green = 255;
      blue = (1 - (ratio - 0.65) / 0.35) * 255;
    }
    return '#' + fullColorHex(Math.round(red), Math.round(green), Math.round(blue));
  }
}

// function to compare two thumbnails with durations
function compareFixationDuration(a: AggregatedFixationPoint, b: AggregatedFixationPoint) {
  const durationA = a.getDuration();
  const durationB = b.getDuration();
  if (durationA > durationB) {
    return -1;
  } else if (durationA < durationB) {
    return 1;
  } else {
    return 0;
  }
}

// function to compare two thumbnails with durations
function compareThumbnailDuration(a: Thumbnail, b: Thumbnail) {
  const durationA = a.getFixationDuration();
  const durationB = b.getFixationDuration();
  if (durationA > durationB) {
    return -1;
  } else if (durationA < durationB) {
    return 1;
  } else {
    return 0;
  }
}

// function to compare two thumbnails with timestamps
function compareThumbnailTimestamp(a: Thumbnail, b: Thumbnail) {
  const durationA = a.getModeTimestamp();
  const durationB = b.getModeTimestamp();
  if (durationA < durationB) {
    return -1;
  } else if (durationA > durationB) {
    return 1;
  } else {
    return 0;
  }
}
