import { Component, Input, OnInit} from '@angular/core';
import { Thumbnail } from './classes/Thumbnail';
import { FixationPoint } from '../classes/FixationPoint';
import { User } from '../classes/User';
import { AttentionCloudService } from '../attention-cloud.service';
import { DisplayConfiguration } from '../classes/DisaplyConfiguration';

@Component({
  selector: 'app-attention-cloud',
  templateUrl: './attention-cloud.component.html',
  styleUrls: ['./attention-cloud.component.css']
})
export class AttentionCloudComponent implements OnInit {
  private stimulusURL: string;
  private thumbnails: Thumbnail[];
  private fixationPoints: FixationPoint[];
  svgWidth = 800;
  svgHeight = 600;
  imageURL: string;
  imageWidth: number;
  imageHeight: number;
  representationType: string;
  private stimulusName: string;
  private userIds: User[];

  constructor(private attentionCloudService: AttentionCloudService) {
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
          this.thumbnails = Thumbnail.get_all_thumbnails(fixationPoints);
        });
      this.imageURL = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
      this.imageWidth = conf.getStimulusWidth();
      this.imageHeight = conf.getStimulusHeight();
    });
    }
}
