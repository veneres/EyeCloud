import { FixationPoint } from '../../classes/FixationPoint';
import { Url } from 'url';

export class Thumbnail {

  private static fixationPoints: FixationPoint[];
  private static maxImageWidth: number;
  private static maxImageHeight: number;
  private static maxDuration: number;
  static imageBackground: Url;
  private fixationPoint: FixationPoint;
  imageWidth: number;
  imageHeight: number;
  thumbnailPortionWidth: number;
  thumbnailPortionHeight: number;
  styleX: number;
  styleY: number;
  positionX: number;
  positionY: number;
  constructor(fixationPoint: FixationPoint, thumbnailPortionWidth: number, thumbnailPortionHeight: number) {
    this.fixationPoint = fixationPoint;
    const sizeFactor = fixationPoint.getDuration() / Thumbnail.maxDuration;
    this.imageHeight = Thumbnail.maxImageHeight * sizeFactor;
    this.imageWidth = Thumbnail.maxImageWidth * sizeFactor;
    this.thumbnailPortionHeight = thumbnailPortionHeight;
    this.thumbnailPortionWidth = thumbnailPortionWidth;
    this.styleX = this.fixationPoint.getX() - thumbnailPortionWidth / 2;
    this.styleY = this.fixationPoint.getY() - thumbnailPortionHeight / 2;

  }

  public static get_all_thumbnails(imageWidth: number,
    imageHeight: number,
    fixationPoints: FixationPoint[],
    thumbnailPortionWidth: number,
    thumbnailPortionHeight: number) {
    Thumbnail.fixationPoints = fixationPoints;
    Thumbnail.maxImageWidth = imageHeight;
    Thumbnail.maxImageHeight = imageWidth;

    // Get the max duration to calculate the size of the thumbnail
    let max_duration = fixationPoints[0].getDuration();
    fixationPoints.forEach(fixation => {
      if (fixation.getDuration() > max_duration) {
        max_duration = fixation.getDuration();
      }
    }
    );
    Thumbnail.maxDuration = max_duration;
    // create all the thumbnail from the given fixations points
    const res = [];
    fixationPoints.forEach(fixation => {
      res.push(new Thumbnail(fixation, thumbnailPortionWidth, thumbnailPortionHeight));
    }
    );
    return res;
  }

}
