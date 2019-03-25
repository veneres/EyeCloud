import { Component, OnInit, Output, EventEmitter, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AttentionCloudService } from '../attention-cloud.service';
import { HeatmapService } from '../heatmap.service';
import { Station } from '../classes/Station';
import { User } from '../classes/User';
import { DisplayConfiguration} from '../classes/DisplayConfiguration';
import { FormGroup, FormControl } from '@angular/forms';
import { Options } from 'ng5-slider';
@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {
  modalRef: BsModalRef;
  currentStimulus: string;
  stimulusWidth: number;
  stimulusHeight: number;
  currentUsers: User[];
  availableStations: Station[];
  currentStation: Station;
  availableUsers: User[];
  sliderTimeStampOptions: Options;
  sliderTimestamp: FormGroup;
  timestampStart: number;
  timestampEnd: number;
  stimuliStationMap: Map<String, Station>;
  constructor(private attentionCloudService: AttentionCloudService,
              private modalService: BsModalService,
              private heatmapService: HeatmapService) {
    this.availableUsers = [];
    this.availableStations = [];
    this.currentUsers = [];
    this.currentStimulus = '';
    this.stimulusWidth = 0;
    this.stimulusHeight = 0;
    this.timestampStart = 0;
    this.timestampEnd = 10;
    this.sliderTimestamp = new FormGroup({
      sliderControl: new FormControl()
    });
    this.stimuliStationMap = new Map();
  }

  ngOnInit() {
    this.attentionCloudService.getAllStations().subscribe((data: Object[]) => {
      data.forEach(element => {
        const name = element['name'];
        const width = parseInt(element['width'], 10);
        const height = parseInt(element['height'], 10);
        const complexity = parseInt(element['complexity'], 10);
        const description = element['description'];
        const stimuli = element['stimuli_list'];
        const station = new Station(name, stimuli, complexity, height, width, description);
        // cache stations
        if (stimuli !== undefined) {
          for (let i = 0; i < stimuli.length; i++) {
            this.stimuliStationMap.set(stimuli[i], station);
          }
        }
        this.availableStations.push(station);
      });
    });
  }

  public toogleSelectedUser(user: User) {
    if (!user.isSelected()) {
      this.currentUsers.push(user);
      user.setSelected(true);
    } else {
      const index_to_remove = this.currentUsers.indexOf(user);
      user.setSelected(false);
      this.currentUsers.splice(index_to_remove, 1);
    }
    this.attentionCloudService.getMinAndMaxTimestamp(this.currentStimulus, this.currentUsers).subscribe((res: any) => {
      this.timestampStart = parseInt(res.min, 10);
      this.timestampEnd = parseInt(res.max, 10);
      this.sliderTimestamp = new FormGroup({
        sliderControl: new FormControl([this.timestampStart, this.sliderTimestamp])
      });
      this.sliderTimeStampOptions = {
        floor: this.timestampStart,
        ceil: this.timestampEnd
      };
    });
  }

  public changeCurrentStimulus(stimulus: string) {
    this.currentStimulus = stimulus;
    this.currentStation = this.stimuliStationMap.get(stimulus);
    this.stimulusWidth = this.currentStation.width;
    this.stimulusHeight = this.currentStation.height;
    this.attentionCloudService.getAllUserByStimulus(stimulus).subscribe((data: string[]) => {
      this.availableUsers = [];
      data.forEach(id => {
        this.availableUsers.push(new User(id));
      });
      this.currentUsers = [];
    });
  }

  generate() {
    this.attentionCloudService.changeDisplayConf(new DisplayConfiguration(
      this.currentUsers,
      this.currentStimulus,
      this.stimulusWidth,
      this.stimulusHeight,
      this.timestampStart,
      this.timestampEnd,
      this.currentStation
    ));
    this.heatmapService.changeDisplayLoading(true);
  }
}
