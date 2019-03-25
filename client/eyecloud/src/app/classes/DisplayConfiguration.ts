import { User } from './User';
import {Station} from './Station';

export class DisplayConfiguration {
  private users: User[];
  private stimulus: string;
  private stimulusWidth: number;
  private stimulusHeight: number;
  private timestampStart: number;
  private timestampEnd: number;
  private station: Station;

  constructor(users: User[], stimulus: string, width: number, height: number,
              timestampStart: number, timestampEnd: number, station: Station) {
    this.users = users;
    this.stimulus = stimulus;
    this.stimulusWidth = width;
    this.stimulusHeight = height;
    this.timestampStart = timestampStart;
    this.timestampEnd = timestampEnd;
    this.station = station;
  }

  getUsers(): User[] {
    return this.users;
  }

  getStimulus(): string {
    return this.stimulus;
  }

  getStimulusWidth(): number {
    return this.stimulusWidth;
  }

  getStimulusHeight(): number {
    return this.stimulusHeight;
  }

  getTimeStampStart(): number {
    return this.timestampStart;
  }

  getTimeStampEnd(): number {
    return this.timestampEnd;
  }

  getStation(): Station {
    return this.station;
  }
}
