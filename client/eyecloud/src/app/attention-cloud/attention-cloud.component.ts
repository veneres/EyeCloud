import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-attention-cloud',
  templateUrl: './attention-cloud.component.html',
  styleUrls: ['./attention-cloud.component.css']
})
export class AttentionCloudComponent implements OnInit {
  stimulusUrl: string;
  userIds: string[];

  constructor(stimulusUrl: string, userIds: string[]) {
    this.stimulusUrl = stimulusUrl;
    this.userIds = userIds;
  }

  ngOnInit() {
  }

}
