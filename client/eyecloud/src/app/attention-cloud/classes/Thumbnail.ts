import { FixationPoint } from '../../classes/FixationPoint';

export class Thumbnail {

  private static maxCroppingSize = 120;
  private static maxDisplayPoints = 30;
  private static minCroppingSize = 20;
  private static startX = 200;
  private static startY = 200;
  private fixationPoint: FixationPoint;
  id: number;
  croppingSize: number;
  styleX: number;
  styleY: number;
  positionX: number;
  positionY: number;

  constructor(id: number, fixationPoint: FixationPoint, croppingSize: number,
              positionX: number, positionY: number) {
    this.id = id;
    this.fixationPoint = fixationPoint;
    this.croppingSize = croppingSize;
    this.styleX = this.fixationPoint.getX();
    this.styleY = this.fixationPoint.getY();
    this.positionX = positionX;
    this.positionY = positionY;
  }

  public static get_thumbnails_for_attention_cloud(fixationPoints: FixationPoint[]) {

    // sort fixation points according to duration
    fixationPoints.sort(compareFixationPointDuration);
    let max_duration = parseInt(fixationPoints[0].getDuration());

    const res = [];
    let counter = 0;
    let numPointsPerCircle = 5;

    fixationPoints.forEach(fixation => {
      let size = parseInt(fixation.getDuration()) / max_duration * this.maxCroppingSize;
      if (counter < this.maxDisplayPoints) {
        if (size < this.minCroppingSize) size = this.minCroppingSize;
        let multiplier = Math.floor(counter / numPointsPerCircle) + 1;
        let radius = this.maxCroppingSize * multiplier;
        let degree = 360 / (numPointsPerCircle * multiplier) * (counter % numPointsPerCircle);
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
function compareFixationPointDuration(a: FixationPoint, b: FixationPoint) {
  let durationA = parseInt(a.getDuration());
  let durationB = parseInt(b.getDuration());
  if (durationA > durationB) {
    return -1;
  } else if (durationA < durationB) {
    return 1;
  } else {
    return 0;
  }
}

