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
  @Input() configuration: DisplayConfiguration;
  usersIdsJson: string;
  stimulusUrl: string;
  showStimulus: boolean;
  constructor(private attentionCloudService: AttentionCloudService) { }
  ngOnChanges(): void {
  }
}
