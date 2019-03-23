import {FixationPoint} from "./FixationPoint";
import {AggregatedFixationPoint} from "./AggregatedFixationPoints";

export class Utilities {

  constructor() {
  }

  public static clusterFixationPoints(fixationPoints: FixationPoint[], clusterRadius: number): AggregatedFixationPoint[] {
    const aggregatedFixationPoints = [];
    fixationPoints.forEach(fixation => {
      let newCluster = true;
      for (let i = 0; i < aggregatedFixationPoints.length; i++) {
        let aggregatedFixation = aggregatedFixationPoints[i];
        if (getSquareDistance(fixation, aggregatedFixation) < clusterRadius * clusterRadius) {
          let numPoints = aggregatedFixation.getNumPoints();
          let averageX = (parseInt(aggregatedFixation.getX()) * numPoints + parseInt(String(fixation.getX()))) / (numPoints + 1);
          let averageY = (parseInt(aggregatedFixation.getY()) * numPoints + parseInt(String(fixation.getY()))) / (numPoints + 1);
          aggregatedFixation.setX(averageX);
          aggregatedFixation.setY(averageY);
          aggregatedFixation.incrementNumPoints();
          aggregatedFixation.incrementDuration(parseInt(fixation.getDuration()));
          newCluster = false;
          break;
        }
      }
      if (newCluster) {
        aggregatedFixationPoints.push(new AggregatedFixationPoint(fixation.getX(), fixation.getY(), parseInt(fixation.getDuration())));
      }
    });
    return aggregatedFixationPoints;
  }
}

function getSquareDistance(fixation: FixationPoint, aggregatedFixation: AggregatedFixationPoint) {
  let x1 = fixation.getX();
  let y1 = fixation.getY();
  let x2 = aggregatedFixation.getX();
  let y2 = aggregatedFixation.getY();
  return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)
}
