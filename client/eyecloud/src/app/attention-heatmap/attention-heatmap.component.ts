import { Component, Input, OnInit } from '@angular/core';
import { AttentionCloudService } from '../attention-cloud.service';
import { User } from '../classes/User';
import { DisplayConfiguration } from '../classes/DisplayConfiguration';
import { HeatmapService } from '../heatmap.service';
import { Options } from 'ng5-slider';

@Component({
  selector: 'app-attention-heatmap',
  templateUrl: './attention-heatmap.component.html',
  styleUrls: ['./attention-heatmap.component.css']
})
export class AttentionHeatmapComponent implements OnInit {
  private users: User[];
  stimulusUrl: string;
  showStimulus: boolean;
  maxVisualSpan: number;
  private stimulusName: string;
  private timestampStart: number;
  private timestampStop: number;
  displayLoading: boolean;
  dataset: any;
  constructor(private attentionCloudService: AttentionCloudService, private heatmapService: HeatmapService) {
    this.maxVisualSpan = 50;
    const visualSpanOption: Options = {
      floor: 70,
      ceil: 150,
      step: 10,
      showSelectionBar: true,
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
      this.stimulusName = conf.getStimulus();
      this.stimulusUrl = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
      this.users = conf.getUsers();
      this.timestampStart = conf.getTimeStampStart();
      this.timestampStop = conf.getTimeStampEnd();
      this.attentionCloudService.getHeatMap(this.users, this.timestampStart, this.timestampStop, this.stimulusName).subscribe((dataset) => {
        this.dataset = dataset;
        this.showStimulus = true;
      });
    });
  }
}
