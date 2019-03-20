import { Component, Input, OnChanges } from '@angular/core';
import { AttentionCloudService } from '../attention-cloud.service';
import { User } from '../classes/User';
import { DisplayConfiguration } from '../classes/DisaplyConfiguration';

@Component({
  selector: 'app-attention-heatmap',
  templateUrl: './attention-heatmap.component.html',
  styleUrls: ['./attention-heatmap.component.css']
})
export class AttentionHeatmapComponent implements OnChanges {

  @Input() stimulusName: string;
  @Input() timestampStart: number;
  @Input() timestampEnd: number;
  @Input() usersIds: User[];
  @Input() configuration: DisplayConfiguration;
  usersIdsJson: string;
  stimulusUrl: string;
  showStimulus: boolean;
  constructor(private attentionCloudService: AttentionCloudService) { }
  ngOnChanges(): void {
    this.stimulusUrl = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
    this.showStimulus = this.stimulusName !== '' && this.usersIds.length !== 0;
    this.usersIdsJson = JSON.stringify(this.usersIds);
  }
}
