import {AggregatedFixationPoint} from "../../classes/AggregatedFixationPoints";

export class Thumbnail {

  private static startX = 200;
  private static startY = 200;
  private fixationPoint: AggregatedFixationPoint;
  id: number;
  croppingSize: number;
  styleX: number;
  styleY: number;
  positionX: number;
  positionY: number;

  constructor(id: number, fixationPoint: AggregatedFixationPoint, croppingSize: number,
              positionX: number, positionY: number) {
    this.id = id;
    this.fixationPoint = fixationPoint;
    this.croppingSize = croppingSize;
    this.styleX = this.fixationPoint.getX();
    this.styleY = this.fixationPoint.getY();
    this.positionX = positionX;
    this.positionY = positionY;
  }

  public static get_thumbnails_for_attention_cloud(fixationPoints: AggregatedFixationPoint[],
                                                   maxCroppingSize: number, minCroppingSize: number, maxDisplayPoints: number) {

    // sort fixation points according to duration
    fixationPoints.sort(compareFixationPointDuration);
    let max_duration = fixationPoints[0].getDuration();

    const res = [];
    let counter = 0;
    let numPointsPerCircle = 5;

    fixationPoints.forEach(fixation => {
      let size = fixation.getDuration() / max_duration * maxCroppingSize;
      if (counter < maxDisplayPoints) {
        if (size < minCroppingSize) size = minCroppingSize;
        let multiplier = Math.floor(counter / numPointsPerCircle) + 1;
        let radius = maxCroppingSize * multiplier;
        let degree = 360 / (numPointsPerCircle * multiplier) * (counter % numPointsPerCircle + 1);
        let posX = this.startX + radius * Math.cos(degree * Math.PI / 180);
        let posY = this.startY + radius * Math.sin(degree * Math.PI / 180);
        res.push(new Thumbnail(counter, fixation, size, posX, posY));
        counter++;
      }
    });
    return res;
  }
}

// function to compare two fixation points with durations
function compareFixationPointDuration(a: AggregatedFixationPoint, b: AggregatedFixationPoint) {
  let durationA = a.getDuration();
  let durationB = b.getDuration();
  if (durationA > durationB) {
    return -1;
  } else if (durationA < durationB) {
    return 1;
  } else {
    return 0;
  }
}

