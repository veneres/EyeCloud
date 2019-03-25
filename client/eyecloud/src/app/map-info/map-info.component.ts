import { Component, OnInit } from '@angular/core';
import { AttentionCloudService } from '../attention-cloud.service';
import { DisplayConfiguration } from '../classes/DisplayConfiguration';
import { Station } from '../classes/Station';

@Component({
  selector: 'app-map-info',
  templateUrl: './map-info.component.html',
  styleUrls: ['./map-info.component.css']
})
export class MapInfoComponent implements OnInit {
  displayComponent = false;
  stimulusName: string;
  imageURL: string;
  imageWidth: number;
  imageHeight: number;
  station: Station;
  complexity: number;
  description: string;
  name: string;

  constructor(private attentionCloudService: AttentionCloudService) { }

  ngOnInit() {
    // the configuration are passed via this observable
    this.attentionCloudService.currentConf.subscribe((conf: DisplayConfiguration) => {
      // default and starting value
      if (conf === undefined) {
        return;
      }
      this.stimulusName = conf.getStimulus();
      if (this.stimulusName !== '') { this.displayComponent = true; }
      this.imageURL = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
      this.imageWidth = conf.getStimulusWidth();
      this.imageHeight = conf.getStimulusHeight();
      this.station = conf.getStation();
      this.complexity = this.station.complexity;
      this.description = this.station.description;
      this.name = this.station.name;
    });
  }

}
