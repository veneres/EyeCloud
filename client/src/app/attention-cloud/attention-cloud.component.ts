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
  thumbnails: Thumbnail[];
  private fixationPoints: FixationPoint[];
  timestampStart: number;
  timestampStop: number;
  imageURL: string;
  imageWidth: number;
  imageHeight: number;
  displayComponent = false;
  private stimulusName: string;
  private userIds: User[];
  maxCroppingSizeValue = 100;
  maxCroppingSizeOptions: Options = {
    floor: 70,
    ceil: 120,
    step: 5,
    showSelectionBar: true,
  };
  minCroppingSizeValue = 20;
  minCroppingSizeOptions: Options = {
    floor: 10,
    ceil: 30,
    step: 5,
    showSelectionBar: true,
  };
  numPointsValue = 20;
  numPointsOptions: Options = {
    floor: 10,
    ceil: 50,
    step: 5,
    showSelectionBar: true,
  };
  clusterRadiusValue = 0;
  clusterRadiusOptions: Options = {
    floor: 0,
    ceil: 500,
    step: 10,
    showSelectionBar: true,
  };
  linkWidth = 5;
  linkWidthOptions: Options = {
    floor: 0,
    ceil: 20,
    step: 2,
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
      // check if all the parameters are present otherwise skip the updating
      if (conf.getUsers().length === 0 || isNaN(conf.getTimeStampStart()) || isNaN(conf.getTimeStampEnd())) {
        this.displayComponent = false;
        return;
      }
      this.stimulusName = conf.getStimulus();
      this.userIds = conf.getUsers();
      this.displayComponent = this.stimulusName !== '' && this.userIds.length > 0;
      this.timestampStart = conf.getTimeStampStart();
      this.timestampStop = conf.getTimeStampEnd();
      const fixationPoints = [];
      this.attentionCloudService.getFixationPoints(this.userIds, this.timestampStart, this.timestampStop, this.stimulusName)
        .subscribe((data) => {
          for (const fixation_n in data) {
            if (data.hasOwnProperty(fixation_n)) {
              if (data[fixation_n].mapInfo.mapName === this.stimulusName) {
                const index = data[fixation_n].fixationPoint.index;
                const x = data[fixation_n].fixationPoint.x;
                const y = data[fixation_n].fixationPoint.y;
                const duration = data[fixation_n].fixationPoint.duration;
                const timestamp = data[fixation_n].fixationPoint.timestamp;
                const user = data[fixation_n].user;
                fixationPoints.push(new FixationPoint(index, x, y, duration, timestamp, user));
              }
            }
          }
          this.fixationPoints = fixationPoints;
          const aggregateFixationPoints = Utilities.clusterFixationPoints(this.fixationPoints, this.clusterRadiusValue);
          this.thumbnails = Thumbnail.get_thumbnails_for_attention_cloud(aggregateFixationPoints,
            this.maxCroppingSizeValue, this.minCroppingSizeValue, this.numPointsValue);
          this.selectedPoint = undefined;
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
      this.selectedPoint = undefined;
    }
}
