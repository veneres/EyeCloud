import { Component, Input, OnChanges } from '@angular/core';
import { AttentionCloudService } from '../attention-cloud.service';

@Component({
  selector: 'app-attention-heatmap',
  templateUrl: './attention-heatmap.component.html',
  styleUrls: ['./attention-heatmap.component.css']
})
export class AttentionHeatmapComponent implements OnChanges {

  @Input() stimulusName: string;
  constructor(private attentionCloudService: AttentionCloudService) { }
  ngOnChanges(): void {
    if (this.stimulusName !== '') {
      this.stimulusName = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
    }
  }
}
