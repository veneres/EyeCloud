import {AggregatedFixationPoint} from '../../classes/AggregatedFixationPoints';

export class Thumbnail {

  private static startX = 200;
  private static startY = 200;
  private static numPointsPerCircle = 5;
  private fixationPoint: AggregatedFixationPoint;
  selected = false;
  id: number;
  croppingSize: number;
  styleX: number;
  styleY: number;
  positionX: number;
  positionY: number;
  modeTimestamp: number;

  constructor(id: number, fixationPoint: AggregatedFixationPoint, croppingSize: number,
              positionX: number, positionY: number) {
    this.id = id;
    this.fixationPoint = fixationPoint;
    this.croppingSize = croppingSize;
    this.styleX = this.fixationPoint.getX();
    this.styleY = this.fixationPoint.getY();
    this.positionX = positionX;
    this.positionY = positionY;
    this.modeTimestamp = fixationPoint.getModeTimestamp();
  }

  public getModeTimestamp(): number {
    return this.modeTimestamp;
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


  public static get_thumbnails_for_attention_cloud(fixationPoints: AggregatedFixationPoint[],
                                                   maxCroppingSize: number, minCroppingSize: number, maxDisplayPoints: number) {

    // sort fixation points according to duration
    fixationPoints.sort(compareFixationPointDuration);
    const max_duration = fixationPoints[0].getDuration();

    const res = [];
    let counter = 0;

    fixationPoints.forEach(fixation => {
      let size = fixation.getDuration() / max_duration * maxCroppingSize;
      if (counter < maxDisplayPoints) {
        if (size < minCroppingSize) { size = minCroppingSize; }
        const multiplier = Math.floor(counter / this.numPointsPerCircle) + 1;
        const radius = maxCroppingSize * multiplier;
        const degree = 360 / (this.numPointsPerCircle * multiplier) * (counter % this.numPointsPerCircle + 1);
        const posX = this.startX + radius * Math.cos(degree * Math.PI / 180);
        const posY = this.startY + radius * Math.sin(degree * Math.PI / 180);
        res.push(new Thumbnail(counter, fixation, size, posX, posY));
        counter++;
      }
    });
    return res;
  }

  public static sortThumbnailsByTimestamp(thumbnails: Thumbnail[]) {
    // sort thumbnails according to mode timestamp
    thumbnails.sort(compareThumbnailTimestamp);
    return thumbnails;
  }
}

// function to compare two fixation points with durations
function compareFixationPointDuration(a: AggregatedFixationPoint, b: AggregatedFixationPoint) {
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
