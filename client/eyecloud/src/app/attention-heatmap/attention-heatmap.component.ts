import { Component, Input, OnChanges } from '@angular/core';
import { AttentionCloudService } from '../attention-cloud.service';

@Component({
  selector: 'app-attention-heatmap',
  templateUrl: './attention-heatmap.component.html',
  styleUrls: ['./attention-heatmap.component.css']
})
export class AttentionHeatmapComponent implements OnChanges {

  @Input() stimulusName: string;
  @Input() private representation: string;
  @Input() usersIds: any;
  stimulusUrl: string;
  showStimulus: boolean;
  constructor(private attentionCloudService: AttentionCloudService) { }
  ngOnChanges(): void {
    this.stimulusUrl = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
    this.showStimulus = this.stimulusName !== '' && this.usersIds !== '';
    if (this.showStimulus) {
      console.log(this.usersIds);
    }
  }
}
