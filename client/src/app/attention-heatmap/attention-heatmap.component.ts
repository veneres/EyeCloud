import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AttentionCloudService } from '../attention-cloud.service';
import { User } from '../classes/User';
import { DisplayConfiguration } from '../classes/DisplayConfiguration';
import { HeatmapService } from '../heatmap.service';
import { Options } from 'ng5-slider';
import { Point } from '../classes/Utilities';
import { Thumbnail } from '../classes/Thumbnail';

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
  hideHeatMapOverlay: boolean;
  focusMode: boolean;
  visualSpanOption: Options;
  clouds: Thumbnail[];
  constructor(private el: ElementRef, private attentionCloudService: AttentionCloudService, private heatmapService: HeatmapService) {
    this.hideHeatMapOverlay = false;
    this.focusMode = false;
    this.visualSpan = 30;
    this.visualSpanOption = {
      floor: 10,
      ceil: 150,
      showSelectionBar: true
    };
    this.displayLoading = false;
  }
  ngOnInit(): void {
    this.heatmapService.currentDisplayLoading.subscribe((display: boolean) => {
      this.displayLoading = display;
    });
    // subscribe to get the last general configuration
    this.attentionCloudService.currentConf.subscribe((conf: DisplayConfiguration) => {
      // default and starting value
      if (conf === undefined ) {
        return;
      }
      // check if all the parameters are present otherwise skip the updating
      if (conf.getUsers().length === 0 || isNaN(conf.getTimeStampStart()) || isNaN(conf.getTimeStampEnd())) {
        this.displayComponent = false;
        return;
      }
      this.currentConfig = conf;
      this.stimulusName = conf.getStimulus();
      this.stimulusUrl = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
      this.users = conf.getUsers();
      this.displayComponent = this.stimulusName !== '' && this.users.length > 0;
      this.timestampStart = conf.getTimeStampStart();
      this.timestampStop = conf.getTimeStampEnd();
      this.attentionCloudService.getHeatMap(this.users,
        this.timestampStart,
        this.timestampStop,
        this.stimulusName,
        this.visualSpan).subscribe((dataset) => {
          this.dataset = dataset;
          this.showStimulus = true;
          this.selectedPoint = undefined;
        });
    });
    this.attentionCloudService.currentSelectedPoint.subscribe((point: Point) => {
      if (point === undefined) {
        return;
      }
      this.selectedPoint = point;
    });

    this.attentionCloudService.cloudsVisible.subscribe((clouds: Thumbnail[]) => {
      this.clouds = clouds;
    });
  }
  canvasClick($event: any) {
    // check if the the click it's inside a visual span of a point
    let inRange = false;
    const realHeight = $event.currentTarget.height;
    const realWidth = $event.currentTarget.width;
    const displayHeight = $event.currentTarget.clientHeight;
    const displayWidth = $event.currentTarget.clientWidth;
    const xClicked = $event.layerX * (realWidth / displayWidth);
    const yClicked = $event.layerY * (realHeight / displayHeight);
    for (const row in this.dataset.points) {
      if (this.dataset.points.hasOwnProperty(row)) {
        if (inRange) {
          break;
        }
        for (const column in this.dataset.points[row]) {
          if (this.dataset.points[row].hasOwnProperty(column)) {
            const distance2 = (xClicked - parseInt(column, 10)) ** 2 + (yClicked - parseInt(row, 10)) ** 2;
            if (distance2 < this.visualSpan ** 2) {
              inRange = true;
              break;
            }
          }
        }
      }
    }
    
    if (inRange) {
      this.attentionCloudService.changeSelectedPoint(new Point(xClicked, yClicked));
    }
  }
  generate() {
    this.heatmapService.changeDisplayLoading(true);
    this.attentionCloudService.changeDisplayConf(this.currentConfig);
  }
}
