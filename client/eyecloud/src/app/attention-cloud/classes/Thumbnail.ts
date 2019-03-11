import { FixationPoint } from '../../classes/FixationPoint';
import { Url } from 'url';

export class Thumbnail {

  private static fixationPoints: FixationPoint[];
  private static maxImageWidth: number;
  private static maxImageHeight: number;
  private static maxDuration: number;
  private static imageBackground: Url;
  private fixationPoint: FixationPoint;
  private imageWidth: number;
  private imageHeight: number;
  constructor(fixationPoint: FixationPoint) {
    this.fixationPoint = fixationPoint;
    const sizeFactor = fixationPoint.getDuration() / Thumbnail.maxDuration;
    this.imageHeight = Thumbnail.maxImageHeight * sizeFactor;
    this.imageWidth = Thumbnail.maxImageWidth * sizeFactor;

  }

  public static get_all_thumbnails(imageWidth: number, imageHeight: number, fixationPoints: FixationPoint[], imageBackground: Url) {
    Thumbnail.fixationPoints = fixationPoints;
    Thumbnail.maxImageWidth = imageHeight;
    Thumbnail.maxImageHeight = imageWidth;
    Thumbnail.imageBackground = imageBackground;

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
      res.push(new Thumbnail(fixation));
    }
    );
    return res;
  }

  public getImageWidth() {
    return this.imageWidth;
  }

  public getImageHeight() {
    return this.imageHeight;
  }

  public getImageBackground() {
    console.log(Thumbnail.imageBackground.toString());
    return Thumbnail.imageBackground;
  }

}
