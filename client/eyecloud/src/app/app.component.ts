import { Component, OnInit } from '@angular/core';
import { DisplayConfiguration } from './classes/DisaplyConfiguration';
import { OptionsComponent } from './options/options.component';
import { User } from './classes/User';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  configuration: DisplayConfiguration;
  showVisualizations: boolean;
  constructor() {
    this.showVisualizations = false;
  }
  ngOnInit(): void {
  }
  public receiveDisplayConfiguration(configuration: DisplayConfiguration) {
    this.configuration = configuration;
    this.showVisualizations = true;
  }
}
