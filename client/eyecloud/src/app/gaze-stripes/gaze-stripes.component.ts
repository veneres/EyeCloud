import { Component, OnInit } from '@angular/core';
import {DisplayConfiguration} from '../classes/DisplayConfiguration';
import {FixationPoint} from '../classes/FixationPoint';
import {User} from '../classes/User';
import {AttentionCloudService} from '../attention-cloud.service';
import {Options} from 'ng5-slider';

@Component({
  selector: 'app-gaze-stripes',
  templateUrl: './gaze-stripes.component.html',
  styleUrls: ['./gaze-stripes.component.css']
})
export class GazeStripesComponent implements OnInit {
  userFixationMap;
  imageURL: string;
  imageWidth: number;
  imageHeight: number;
  timestampStart: number;
  timestampStop: number;
  displayComponent = false;
  stimulusName: string;
  userIds: User[];
  scaleValue = 30;
  scaleOptions: Options = {
    floor: 10,
    ceil: 100,
    step: 10,
    showSelectionBar: true,
  };

  constructor(private attentionCloudService: AttentionCloudService) { }

  ngOnInit() {
    // the configuration are passed via this observable
    this.attentionCloudService.currentConf.subscribe((conf: DisplayConfiguration) => {
      // default and starting value
      if (conf === undefined) {
        return;
      }
      // check if all the parameters are present otherwise skip the updating
      if (conf.getUsers().length === 0 || conf.getTimeStampStart() === NaN || conf.getTimeStampEnd() === NaN) {
        return;
      }
      this.stimulusName = conf.getStimulus();
      this.userIds = conf.getUsers();
      this.displayComponent = this.stimulusName !== '' && this.userIds.length > 0;
      this.timestampStart = conf.getTimeStampStart();
      this.timestampStop = conf.getTimeStampEnd();
      const userFixationMap = {};
      this.attentionCloudService.getGazeStripes(this.userIds, this.timestampStart, this.timestampStop, this.stimulusName)
        .subscribe((data) => {
          for (const entry in data) {
            if (data.hasOwnProperty(entry)) {
              const fixationPoints = [];
              const fixations = data[entry];
              for (const fixation in fixations) {
                if (fixations.hasOwnProperty(fixation)) {
                  if (fixations[fixation].mapInfo.mapName === this.stimulusName) {
                    const index = fixations[fixation].fixationPoint.index;
                    const x = fixations[fixation].fixationPoint.x;
                    const y = fixations[fixation].fixationPoint.y;
                    const duration = fixations[fixation].fixationPoint.duration;
                    const timestamp = fixations[fixation].fixationPoint.timestamp;
                    const user = fixations[fixation].user;
                    fixationPoints.push(new FixationPoint(index, x, y, duration, timestamp, user));
                  }
                }
              }
              fixationPoints.sort(compareFixationPointTimestamp);
              userFixationMap[entry] = fixationPoints;
            }
          }
          this.userFixationMap = userFixationMap;
        });
      this.imageURL = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
      this.imageWidth = conf.getStimulusWidth();
      this.imageHeight = conf.getStimulusHeight();
    });
  }
}

// function to compare two fixation points with durations
function compareFixationPointTimestamp(a: FixationPoint, b: FixationPoint) {
  const durationA = parseInt(a.getTimestamp(), 10);
  const durationB = parseInt(b.getTimestamp(), 10);
  if (durationA > durationB) {
    return 1;
  } else if (durationA < durationB) {
    return -1;
  } else {
    return 0;
  }
}
