import { Component, OnInit } from '@angular/core';
import {DisplayConfiguration} from "../classes/DisplayConfiguration";
import {FixationPoint} from "../classes/FixationPoint";
import {AttentionCloudService} from "../attention-cloud.service";
import {User} from "../classes/User";

@Component({
  selector: 'app-raw-data',
  templateUrl: './raw-data.component.html',
  styleUrls: ['./raw-data.component.css']
})
export class RawDataComponent implements OnInit {

  displayComponent = false;
  stimulusName: string;
  userIds: User[];
  timestampStart: number;
  timestampStop: number;
  fixationPoints: FixationPoint[]

  constructor(private attentionCloudService: AttentionCloudService) { }

  ngOnInit() {
    this.attentionCloudService.currentConf.subscribe((conf: DisplayConfiguration) => {
      // default and starting value
      if (conf === undefined) {
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
        })
    })
  }
}
