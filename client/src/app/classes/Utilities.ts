import { FixationPoint } from './FixationPoint';
import { AggregatedFixationPoint } from './AggregatedFixationPoints';

export class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Utilities {

  constructor() {
  }

  public static clusterFixationPoints(fixationPoints: FixationPoint[], clusterRadius: number): AggregatedFixationPoint[] {
    const aggregatedFixationPoints = [];
    fixationPoints.forEach(fixation => {
      let newCluster = true;
      for (let i = 0; i < aggregatedFixationPoints.length; i++) {
        const aggregatedFixation = aggregatedFixationPoints[i];
        if (getSquareDistance(fixation, aggregatedFixation) < clusterRadius * clusterRadius) {
          const numPoints = aggregatedFixation.getNumPoints();
          const averageX = (parseInt(aggregatedFixation.getX(), 10) * numPoints + parseInt(String(fixation.getX()), 10)) / (numPoints + 1);
          const averageY = (parseInt(aggregatedFixation.getY(), 10) * numPoints + parseInt(String(fixation.getY()), 10)) / (numPoints + 1);
          aggregatedFixation.setX(averageX);
          aggregatedFixation.setY(averageY);
          aggregatedFixation.incrementNumPoints();
          aggregatedFixation.incrementDuration(parseInt(fixation.getDuration(), 10));
          aggregatedFixation.addTimestamp(parseInt(fixation.getTimestamp(), 10));
          newCluster = false;
          break;
        }
      }
      if (newCluster) {
        aggregatedFixationPoints.push(new AggregatedFixationPoint(fixation.getX(), fixation.getY(),
          parseInt(fixation.getDuration(), 10), parseInt(fixation.getTimestamp(), 10)));
      }
    });
    return aggregatedFixationPoints;
  }

  public static euclideanDistance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

}

function getSquareDistance(fixation: FixationPoint, aggregatedFixation: AggregatedFixationPoint) {
  const x1 = fixation.getX();
  const y1 = fixation.getY();
  const x2 = aggregatedFixation.getX();
  const y2 = aggregatedFixation.getY();
  return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
}
