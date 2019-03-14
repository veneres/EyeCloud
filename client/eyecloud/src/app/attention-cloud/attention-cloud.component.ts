import { Component, Input, OnChanges} from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import { Thumbnail } from './classes/Thumbnail';
import { FixationPoint } from '../classes/FixationPoint';
import { User } from '../classes/User';
import { AttentionCloudService } from '../attention-cloud.service';

@Component({
  selector: 'app-attention-cloud',
  templateUrl: './attention-cloud.component.html',
  styleUrls: ['./attention-cloud.component.css']
})
export class AttentionCloudComponent implements OnChanges {
  private stimulusURL: string;
  private thumbnails: Thumbnail[];
  svgWidth = 800;
  svgHeight = 600;
  imageBackground: SafeStyle;
  @Input()
  private representation: string;
  @Input()
  private stimulusName: string;
  @Input()
  private userIds: any;
  @Input()
  private max_thumbnail_size: number;
  // TODO find a better name to this field
  @Input()
  private thumbnail_portion_width: number;

  constructor(private attentionCloudService: AttentionCloudService, private sanitaizer: DomSanitizer) {
  }

  ngOnChanges() {
    // if there isn't a stimulus set  or a set of users return
    if (this.stimulusName === '') {
        return;
    }
    console.log("representation: "+this.representation);
    // TODO fix this workaround
    if (typeof this.userIds  === 'string') {
      this.userIds = this.userIds.split(',');
    }
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
        this.thumbnails = Thumbnail.get_all_thumbnails(fixationPoints, this.representation);
        const image_url = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
        this.imageBackground = this.sanitaizer.bypassSecurityTrustStyle(`url(${image_url})`);
      });
  }
}
