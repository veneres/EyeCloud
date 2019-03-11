import { Component, OnInit, Input } from '@angular/core';
import { Thumbnail } from './classes/Thumbnail';
import { FixationPoint } from '../classes/FixationPoint';
import { User } from '../classes/User';
import { AttentionCloudService } from '../attention-cloud.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-attention-cloud',
  templateUrl: './attention-cloud.component.html',
  styleUrls: ['./attention-cloud.component.css']
})
export class AttentionCloudComponent implements OnInit {
  private stimulusURL: string;
  private thumbnails: Thumbnail[];
  @Input()
  private stimulusName: string;
  @Input()
  private userIds: any;
  @Input()
  private thumbnail_size: number;

  constructor(private attentionCloudService: AttentionCloudService) {
  }

  ngOnInit() {
    this.userIds = this.userIds.split(',');
    const fixationPoints = [];
    this.attentionCloudService.getFixationPoints(new User(this.userIds[0]), this.stimulusName)
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
        this.thumbnails =
          Thumbnail.get_all_thumbnails(
            this.thumbnail_size,
            this.thumbnail_size,
            fixationPoints,
            this.attentionCloudService.getStimulusURL(this.stimulusName));
      });
  }
}
