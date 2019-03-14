import { FixationPoint } from '../../classes/FixationPoint';

export class Thumbnail {

  public static MAX_CROPPING_SIZE = 80;
  public static CLOUD_SIZE = 600;
  private static numImagesInOneRound = 6;
  private static maxDuration: number;
  private fixationPoint: FixationPoint;
  croppingSize: number;
  styleX: number;
  styleY: number;
  styleBorderRadius: string
  positionX: number;
  positionY: number;
  constructor(fixationPoint: FixationPoint, croppingSize: number,
              positionX: number, positionY: number, borderRadius: string) {
    this.fixationPoint = fixationPoint;
    this.croppingSize = croppingSize;
    this.styleX = this.fixationPoint.getX();
    this.styleY = this.fixationPoint.getY();
    this.styleBorderRadius = borderRadius;
    this.positionX = positionX;
    this.positionY = positionY;

  }

  public static get_all_thumbnails(fixationPoints: FixationPoint[], representationType: string) {

    // Get the max duration to calculate the size of the thumbnail
    let max_duration = fixationPoints[0].getDuration();
    fixationPoints.forEach(fixation => {
      if (fixation.getDuration() > max_duration) {
        max_duration = fixation.getDuration();
      }
    });
    Thumbnail.maxDuration = max_duration;

    // sort fixation points according to duration
    fixationPoints.sort(compareFixationPointDuration);

    const res = [];

    if (representationType === "circular") {

      let borderRadius = "50%";

      // create all the thumbnail from the given fixations points
      let counter = 0;
      let multiplier = 1;
      let imageMultiplier = 1;
      let posX, posY;
      let startPointLists = [[(this.CLOUD_SIZE - this.MAX_CROPPING_SIZE) / 2, (this.CLOUD_SIZE - this.MAX_CROPPING_SIZE) / 2]];
      fixationPoints.forEach(fixation => {
        let displaySize = fixation.getDuration() / max_duration * this.MAX_CROPPING_SIZE;
        if (startPointLists.length > 0) {
          posX = startPointLists[0][0];
          posY = startPointLists[0][1];
        } else {
          posX = 0;
          posY = 0;
        }

        // remove the first start point in the list
        startPointLists.shift();

        if (counter % this.numImagesInOneRound == 0) {
          startPointLists = this.addStartPointsToOuterCircle(startPointLists,
            (this.CLOUD_SIZE - this.MAX_CROPPING_SIZE) / 2 + (multiplier - 1) * displaySize / 2.5,
            (this.CLOUD_SIZE - this.MAX_CROPPING_SIZE ) / 2 + (multiplier - 1) * displaySize / 2.5,
            (this.MAX_CROPPING_SIZE * 2 + displaySize) / 3 * multiplier, this.numImagesInOneRound * imageMultiplier,
            60 * multiplier);
          multiplier = multiplier + 1;
          imageMultiplier = imageMultiplier + 2;
        }
          res.push(new Thumbnail(fixation, displaySize, posX, posY, borderRadius));

        counter++;
      });
    } else {

      let pixelMatrix = initializePixelMatrix(800, 600);
      // locate the biggest image to middle
      let firstPoint = fixationPoints[0];
      let displaySize = firstPoint.getDuration() / max_duration * this.MAX_CROPPING_SIZE;
      res.push(new Thumbnail(firstPoint, displaySize, 400, 300, ""));
      this.markPixels(pixelMatrix, 400, 300, Math.floor(displaySize / 2));
      fixationPoints.shift();

      let searchPoints = [[400, 300, displaySize]];

      while (fixationPoints.length > 0) {

        // for each searchPoints, search up, right, down, left
        let numSearchPoints = searchPoints.length;
        console.log(numSearchPoints);
        for (let i = 0; i < numSearchPoints; i++) {
          let pointPosX = searchPoints[i][0];
          let pointPosY = searchPoints[i][1];
          let pointSize = searchPoints[i][2];

          // search up
          if (fixationPoints[0]) {
            let size = fixationPoints[0].getDuration() / max_duration * this.MAX_CROPPING_SIZE;
            let posX = Math.floor(pointPosX);
            let posY = Math.floor(pointPosY - size - 1);
            if (this.isPositionAvailable(pixelMatrix, posX, posY, Math.floor(size / 2))) {
              res.push(new Thumbnail(fixationPoints[0], Math.floor(size), posX, posY, ""));
              this.markPixels(pixelMatrix, posX, posY, Math.floor(size / 2));
              console.log("up " + this.getPixels(pixelMatrix));
              fixationPoints.shift();
              searchPoints.push([posX, posY, size])
            }
          } else {
            break;
          }

          // search right
          if (fixationPoints[0]) {
            let size = fixationPoints[0].getDuration() / max_duration * this.MAX_CROPPING_SIZE;
            let posX = Math.floor(pointPosX + pointSize + size + 1);
            let posY = Math.floor(pointPosY);
            if (this.isPositionAvailable(pixelMatrix, posX, posY, Math.floor(size / 2))) {
              res.push(new Thumbnail(fixationPoints[0], Math.floor(size), posX, posY, ""));
              this.markPixels(pixelMatrix, posX, posY, Math.floor(size / 2));
              console.log("right " + this.getPixels(pixelMatrix));
              fixationPoints.shift();
              searchPoints.push([posX, posY, size])
            }
          } else {
            break;
          }

          // search down
          if (fixationPoints[0]) {
            let size = fixationPoints[0].getDuration() / max_duration * this.MAX_CROPPING_SIZE;
            let posX = Math.floor(pointPosX);
            let posY = Math.floor(pointPosY + pointSize + size + 1);
            if (this.isPositionAvailable(pixelMatrix, posX, posY, Math.floor(size / 2))) {
              res.push(new Thumbnail(fixationPoints[0], Math.floor(size), posX, posY, ""));
              this.markPixels(pixelMatrix, posX, posY, Math.floor(size / 2));
              console.log("down " + this.getPixels(pixelMatrix));
              fixationPoints.shift();
              searchPoints.push([posX, posY, size])
            }
          } else {
            break;
          }

          // search left
          if (fixationPoints[0]) {
            let size = fixationPoints[0].getDuration() / max_duration * this.MAX_CROPPING_SIZE;
            let posX = Math.floor(pointPosX - size - 1);
            let posY = Math.floor(pointPosY);
            if (this.isPositionAvailable(pixelMatrix, posX, posY, Math.floor(size / 2))) {
              res.push(new Thumbnail(fixationPoints[0], Math.floor(size), posX, posY, ""));
              this.markPixels(pixelMatrix, posX, posY, Math.floor(size / 2));
              console.log("left " + this.getPixels(pixelMatrix));
              fixationPoints.shift();
              searchPoints.push([posX, posY, size])
            }
          } else {
            break;
          }
        }
        for (let i = 0; i < numSearchPoints; i++) {
          searchPoints.shift();
        }

      }
    }

    return res;
  }

  private static addStartPointsToOuterCircle(startPointLists:number[][], centerX: number, centerY: number,
                                             radius: number, numPoints: number, degreeOffset: number) {
    let degree = 360 / numPoints;
    for (let i = 0; i < numPoints; i++) {
      let rad = (degree * i + degreeOffset) * Math.PI / 180;
      let posX = centerX + radius * Math.cos(rad );
      let posY = centerY + radius * Math.sin(rad );
      startPointLists.push([posX, posY]);
    }
    return startPointLists;
  }

  private static markPixels(pixelMatrix: number[][], centerX: number, centerY: number, size: number) {
    for (let i = centerY - size; i <= centerY + size; i++) {
      for (let j = centerX - size; j <= centerX + size; j++) {
        pixelMatrix[i][j] = 1;
      }
    }
    return pixelMatrix;
  }

  private static isPositionAvailable(pixelMatrix: number[][], posX: number, posY: number, size: number) {
    if (posY - size < 0 || posX - size < 0 || posY + size >= 600 || posX + size >= 800) {
      return false;
    } else {
      for (let i = posY - size; i <= posY + size; i++) {
        for (let j = posX - size; j <= posY + size; j++) {
          if (pixelMatrix[i][j] === 1) {
            return false;
          }
        }
      }
      return true;
    }
  }

  private static getPixels(pixelMatrix: number[][]) {
    let counter = 0;
    for (let i = 0; i < pixelMatrix.length; i++) {
      for (let j = 0; j < pixelMatrix[i].length; j++) {
        if (pixelMatrix[i][j] === 1) counter++;
      }
    }
    return counter;
  }
}

// function to compare two fixation points with durations
function compareFixationPointDuration(a: FixationPoint, b: FixationPoint) {
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

// function to initialize Pixel Matrix
function initializePixelMatrix(width: number, height: number) {
  let arr = []
  for (let i = 0; i < height; i++) {
    arr[i] = [];
    for (let j = 0; j < width; j++) {
      arr[i][j] = 0;
    }
  }
  return arr;
}
