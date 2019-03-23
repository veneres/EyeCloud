import { Component, OnInit } from '@angular/core';
import {DisplayConfiguration} from '../classes/DisplayConfiguration';
import {FixationPoint} from '../classes/FixationPoint';
import {User} from '../classes/User';
import {AttentionCloudService} from '../attention-cloud.service';

@Component({
  selector: 'app-gaze-stripes',
  templateUrl: './gaze-stripes.component.html',
  styleUrls: ['./gaze-stripes.component.css']
})
export class GazeStripesComponent implements OnInit {
  private fixationPoints: FixationPoint[];
  imageURL: string;
  imageWidth: number;
  imageHeight: number;
  private stimulusName: string;
  private userIds: User[];

  constructor(private attentionCloudService: AttentionCloudService) { }

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
          this.fixationPoints = fixationPoints.sort(compareFixationPointTimestamp);
        });
      this.imageURL = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
      this.imageWidth = conf.getStimulusWidth();
      this.imageHeight = conf.getStimulusHeight();
    });
  }
}

// function to compare two fixation points with durations
function compareFixationPointTimestamp(a: FixationPoint, b: FixationPoint) {
  let durationA = parseInt(a.getTimestamp());
  let durationB = parseInt(b.getTimestamp());
  if (durationA > durationB) {
    return 1;
  } else if (durationA < durationB) {
    return -1;
  } else {
    return 0;
  }
}
