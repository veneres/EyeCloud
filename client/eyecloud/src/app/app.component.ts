import { Component, OnInit } from '@angular/core';
import { OptionsComponent } from './options/options.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  usersArray: string[];
  currentStimulus: string;
  displayMode: string;
  ngOnInit(): void {

  }
  public receiveNewUsersArray($event) {
    console.log($event);
    this.usersArray = $event.split(',');
  }
  public receiveDisplayModeEvent($event) {
     this.displayMode = $event;
  }
  public receiveNewStimulus($event) {
    this.currentStimulus = $event;
  }
}
