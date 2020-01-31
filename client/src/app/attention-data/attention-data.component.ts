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
  clouds: Thumbnail[];
  selectedPoint: AggregatedFixationPoint;

  constructor(private attentionCloudService: AttentionCloudService) {
    this.displayComponent = false;
    this.clouds = [];
  }
  ngOnInit() {
    this.attentionCloudService.cloudsVisible.subscribe((clouds: Thumbnail[]) => {
      if (clouds) {
        this.clouds = clouds;
      }
    });
    this.attentionCloudService.currentSelectedPoint.subscribe((point: Point) => {
      if (this.clouds && this.clouds.length > 0) {
        for (let i = 0; i < this.clouds.length; i++) {
          let cloud = this.clouds[i];
          if (cloud.styleX == point.x && cloud.styleY == point.y) {
            this.selectedPoint = cloud.getAggregatedFixationPoint();
            break;
          }
        }
        this.displayComponent = !!this.selectedPoint;
      } else {
        this.displayComponent = false;
      }
    });
  }
}
