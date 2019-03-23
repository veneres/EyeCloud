import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AttentionCloudService } from '../attention-cloud.service';
import { User } from '../classes/User';
import { DisplayConfiguration } from '../classes/DisplayConfiguration';
import { HeatmapService } from '../heatmap.service';
import { Options } from 'ng5-slider';
import { Point } from '../classes/Utilities';

@Component({
  selector: 'app-attention-heatmap',
  templateUrl: './attention-heatmap.component.html',
  styleUrls: ['./attention-heatmap.component.css']
})
export class AttentionHeatmapComponent implements OnInit {
  private users: User[];
  stimulusUrl: string;
  showStimulus: boolean;
  visualSpan: number;
  displayComponent = false;
  private stimulusName: string;
  private timestampStart: number;
  private timestampStop: number;
  private currentConfig: DisplayConfiguration;
  selectedPoint: Point;
  displayLoading: boolean;
  dataset: any;
  visualSpanOption: Options;
  constructor(private el: ElementRef, private attentionCloudService: AttentionCloudService, private heatmapService: HeatmapService) {
    this.visualSpan = 30;
    this.visualSpanOption = {
      floor: 10,
      ceil: 150
    };
    this.displayLoading = false;
  }
  ngOnInit(): void {
    this.heatmapService.currentDisplayLoading.subscribe((display: boolean) => {
      this.displayLoading = display;
    });
    this.attentionCloudService.currentConf.subscribe((conf: DisplayConfiguration) => {
      // default and starting value
      if (conf === undefined) {
        return;
      }
      this.currentConfig = conf;
      this.stimulusName = conf.getStimulus();
      this.stimulusUrl = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
      this.users = conf.getUsers();
      if (this.stimulusName != '' && this.users.length > 0) this.displayComponent = true;
      this.timestampStart = conf.getTimeStampStart();
      this.timestampStop = conf.getTimeStampEnd();
      this.attentionCloudService.getHeatMap(this.users,
                                            this.timestampStart,
                                            this.timestampStop,
                                            this.stimulusName,
                                            this.visualSpan).subscribe((dataset) => {
          this.dataset = dataset;
          this.showStimulus = true;
        });
    });
    this.attentionCloudService.currentSelectedPoint.subscribe((point: Point) => {
      if (point === undefined) {
        return;
      }
      this.selectedPoint = point;
    });
  }
  canvasClick($event: any) {
    const realHeight = $event.currentTarget.height;
    const realWidth = $event.currentTarget.width;
    const displayHeight = $event.currentTarget.clientHeight;
    const displayWidth = $event.currentTarget.clientWidth;
    const xClicked = $event.layerX * (realWidth / displayWidth);
    const yClicked = $event.layerY * (realHeight / displayHeight);
    this.attentionCloudService.changeSelectedPoint(new Point(xClicked, yClicked));
  }
  generate() {
    this.attentionCloudService.changeDisplayConf(this.currentConfig);
    this.heatmapService.changeDisplayLoading(true);
  }
}
