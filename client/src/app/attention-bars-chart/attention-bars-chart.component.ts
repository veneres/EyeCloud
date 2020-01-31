import { Component, OnInit } from '@angular/core';
import { AttentionCloudService } from '../attention-cloud.service';
import { Thumbnail } from '../classes/Thumbnail';
import { DisplayConfiguration } from '../classes/DisplayConfiguration';
import { Point } from '../classes/Utilities';

@Component({
  selector: 'app-attention-bars-chart',
  templateUrl: './attention-bars-chart.component.html',
  styleUrls: ['./attention-bars-chart.component.css']
})
export class AttentionBarsChartComponent implements OnInit {

  displayComponent: boolean;
  clouds: Thumbnail[];
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  selectedPoint: Point;
  constructor(private attentionCloudService: AttentionCloudService) {
    this.displayComponent = false;
  }

  ngOnInit() {
    this.attentionCloudService.cloudsVisible.subscribe((clouds: Thumbnail[]) => {
      if (clouds) {
        this.displayComponent = clouds.length > 0;
        console.log(this.displayComponent);
        this.clouds = clouds;
      }
    });
    this.attentionCloudService.currentConf.subscribe((conf: DisplayConfiguration) => {
      if (conf) {
        this.imageUrl = this.attentionCloudService.getStimulusURL(conf.getStimulus()).toString();
        this.imageHeight = conf.getStimulusHeight();
        this.imageWidth = conf.getStimulusWidth();

      }
    });
    this.attentionCloudService.currentSelectedPoint.subscribe(point => {
      if (point) {
        this.selectedPoint = point;
      }
    })
  }

}
