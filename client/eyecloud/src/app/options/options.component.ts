import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AttentionCloudService } from '../attention-cloud.service';
import { Station } from '../classes/Station';
@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {

  currentStimulus: string;
  displayMode = 'circular';
  currentUsers: string[] = [];
  availableStations: Station[] = [];
  availableUsers: string[];
  @Output() currentStimulusEvent = new EventEmitter<string>();
  @Output() displayModeEvent = new EventEmitter<string>();
  @Output() currentUsersArrayEvent = new EventEmitter<string>();
  constructor(private attentionCloudService: AttentionCloudService) { }

  ngOnInit() {
    this.attentionCloudService.getAllStations().subscribe((data: Object[]) => {
      data.forEach(element => {
        const name = element['name'];
        const width = parseInt(element['width'], 10);
        const height = parseInt(element['height'], 10);
        const complexity = parseInt(element['complexity'], 10);
        const description = element['description'];
        const stimuli = element['stimuli_list'];

        this.availableStations.push(new Station(name, stimuli, complexity, height, width, description));
      });
    });
  }

  public sendNewStimulus() {
    this.sendCurrentDisplayMode();
    this.currentStimulusEvent.emit(this.currentStimulus);
  }
  public sendCurrentUsersArrayEvent() {
    this.currentUsersArrayEvent.emit(this.currentUsers.toString());
  }

  public sendCurrentDisplayMode() {
    this.displayModeEvent.emit(this.displayMode);
  }

  public changeCurrentUsers(user) {
    this.currentUsers = [user];
    this.sendCurrentUsersArrayEvent();
    this.sendNewStimulus();
  }

  public changeCurrentStimulus(stimulus) {
    this.currentStimulus = stimulus;
    this.attentionCloudService.getAllUserByStimulus(stimulus).subscribe((data: string[]) => {
      this.availableUsers = [];
      data.forEach(element => {
        this.availableUsers.push(element);
      });
      if (data.length > 0) {
        let usersFound = 0;
        // check if the current users can be used to display the new stimulus
        this.currentUsers.forEach((userToFound) => {
          this.availableUsers.forEach((userAvailable) => {
            if (userToFound === userAvailable) {
              usersFound += 1;
            }
          });
        });
        if (usersFound !== this.currentUsers.length) {
          this.currentUsers = [];
          this.sendCurrentUsersArrayEvent();
        }
      }
    });
  }

  public changeRepresentation(type) {
    this.displayMode = type;
    this.sendCurrentDisplayMode();
  }

}
