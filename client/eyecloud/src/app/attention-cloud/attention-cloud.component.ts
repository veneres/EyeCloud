import { Component, OnInit} from '@angular/core';
import { Thumbnail } from './classes/Thumbnail';
import { FixationPoint } from '../classes/FixationPoint';
import { User } from '../classes/User';
import { AttentionCloudService } from '../attention-cloud.service';
import { DisplayConfiguration } from '../classes/DisplayConfiguration';
import { Utilities } from '../classes/Utilities';
import { Options } from 'ng5-slider';
import { Point } from '../classes/Utilities';

@Component({
  selector: 'app-attention-cloud',
  templateUrl: './attention-cloud.component.html',
  styleUrls: ['./attention-cloud.component.css']
})
export class AttentionCloudComponent implements OnInit {
  private stimulusURL: string;
  thumbnails: Thumbnail[];
  private fixationPoints: FixationPoint[];
  svgWidth = 400;
  svgHeight = 400;
  imageURL: string;
  imageWidth: number;
  imageHeight: number;
  private stimulusName: string;
  private userIds: User[];
  maxCroppingSizeValue = 100;
  maxCroppingSizeOptions: Options = {
    floor: 70,
    ceil: 150,
    step: 10,
    showSelectionBar: true,
  };
  minCroppingSizeValue = 20;
  minCroppingSizeOptions: Options = {
    floor: 10,
    ceil: 50,
    step: 5,
    showSelectionBar: true,
  };
  numPointsValue = 100;
  numPointsOptions: Options = {
    floor: 10,
    ceil: 50,
    step: 5,
    showSelectionBar: true,
  };
  clusterRadiusValue = 50;
  clusterRadiusOptions: Options = {
    floor: 0,
    ceil: 500,
    step: 10,
    showSelectionBar: true,
  };
  selectedPoint: Point;

  constructor(private attentionCloudService: AttentionCloudService) {
    this.selectedPoint = undefined;
  }

  ngOnInit() {
    // the configuration are passed via this observable
    this.attentionCloudService.currentConf.subscribe((conf: DisplayConfiguration) => {
      // default and starting value
      if (conf === undefined) {
        return;
      }
      this.stimulusName = conf.getStimulus();
      this.userIds = conf.getUsers();
      const fixationPoints = [];
      this.attentionCloudService.getFixationPoints(this.userIds[0], this.stimulusName)
        .subscribe((data) => {
          for (const fixation_n in data) {
            if (data.hasOwnProperty(fixation_n)) {
              if (data[fixation_n].mapInfo.mapName === this.stimulusName) {
                const index = data[fixation_n].fixationPoint.index;
                const x = data[fixation_n].fixationPoint.x;
                const y = data[fixation_n].fixationPoint.y;
                const duration = data[fixation_n].fixationPoint.duration;
                const timestamp = data[fixation_n].fixationPoint.timestamp;
                fixationPoints.push(new FixationPoint(index, x, y, duration, timestamp));
              }
            }
          }
          this.fixationPoints = fixationPoints;
          const aggregateFixationPoints = Utilities.clusterFixationPoints(this.fixationPoints, this.clusterRadiusValue);
          this.thumbnails = Thumbnail.get_thumbnails_for_attention_cloud(aggregateFixationPoints,
            this.maxCroppingSizeValue, this.minCroppingSizeValue, this.numPointsValue);
        });
      this.imageURL = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
      this.imageWidth = conf.getStimulusWidth();
      this.imageHeight = conf.getStimulusHeight();
    });
    this.attentionCloudService.currentSelectedPoint.subscribe((point: Point) => {
      if (point === undefined) {
        return;
      }
      this.selectedPoint = point;
    });
    }

    generate() {
      const aggregateFixationPoints = Utilities.clusterFixationPoints(this.fixationPoints, this.clusterRadiusValue);
      this.thumbnails = Thumbnail.get_thumbnails_for_attention_cloud(aggregateFixationPoints,
        this.maxCroppingSizeValue, this.minCroppingSizeValue, this.numPointsValue);
    }
}
