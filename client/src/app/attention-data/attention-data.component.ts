import { Component, OnInit } from '@angular/core';
import { AttentionCloudService } from '../attention-cloud.service';
import { Point, Utilities } from '../classes/Utilities';
import { Thumbnail } from '../classes/Thumbnail';
import { AggregatedFixationPoint } from '../classes/AggregatedFixationPoints';

@Component({
  selector: 'app-attention-data',
  templateUrl: './attention-data.component.html',
  styleUrls: ['./attention-data.component.css']
})
export class AttentionDataComponent implements OnInit {

  displayComponent: boolean;
  displayStatistics: boolean;
  clouds: Thumbnail[];
  selectedPoint: AggregatedFixationPoint;
  displayedData;

  constructor(private attentionCloudService: AttentionCloudService) {
    this.displayComponent = false;
    this.displayStatistics = false;
    this.clouds = [];
    this.displayedData = {};
  }
  ngOnInit() {
    this.attentionCloudService.cloudsVisible.subscribe((clouds: Thumbnail[]) => {
      if (clouds) {
        this.clouds = clouds;
        this.displayComponent = true;
      } else {
        this.displayComponent = false;
      }
    });
    this.attentionCloudService.currentSelectedPoint.subscribe((point: Point) => {
      if (this.clouds && this.clouds.length > 0) {
        for (let i = 0; i < this.clouds.length; i++) {
          let cloud = this.clouds[i];
          if (cloud.styleX == point.x && cloud.styleY == point.y) {
            this.selectedPoint = cloud.getAggregatedFixationPoint();
            this.updateDisplayedData();
            break;
          }
        }
        this.displayStatistics = !!this.selectedPoint;
      } else {
        this.displayStatistics = false;
      }
    });
  }

  private updateDisplayedData() {
    const d = this.displayedData;
    const p = this.selectedPoint;
    d.X = Math.round(p.getX());
    d.Y = Math.round(p.getY());
    d.Duration = Math.round(p.getDuration());
    d.ModeTimestamp = p.getModeTimestamp(1000);
    d.Timestamps = p.getBinsOfTimestamps(1000);
    d.TimestampBins = Object.keys(d.Timestamps);
    d.NumPoints = p.getNumPoints();
  }
}
