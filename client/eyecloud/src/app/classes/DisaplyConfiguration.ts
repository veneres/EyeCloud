import { User } from './User';

export class DisplayConfiguration {
  private users: User[];
  private stimulus: string;
  private timestampStart: number;
  private timestampEnd: number;

  constructor(users: User[], stimulus: string, timestampStart: number, timestampEnd: number) {
    this.users = users;
    this.stimulus = stimulus;
    this.timestampStart = timestampStart;
    this.timestampEnd = timestampEnd;
  }

  getUsers(): User[] {
    return this.users;
  }
  getStimulus(): string {
    return this.stimulus;
  }
  getTimeStampStart(): number {
    return this.timestampStart;
  }

  getTimeStampEnd(): number {
    return this.timestampEnd;
  }


}
