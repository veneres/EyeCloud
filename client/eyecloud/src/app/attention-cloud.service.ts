import { Injectable } from '@angular/core';
import { User } from './classes/User';
import { HttpClient } from '@angular/common/http';
import { Url } from 'url';

@Injectable({
  providedIn: 'root',
})
export class AttentionCloudService {
  baseUrl = 'http://192.168.99.100:5000';

  constructor(private http: HttpClient) {

  }

  public getStimulusURL(stimulusName: string): Url {
    return new URL(`${this.baseUrl}/stimuli/${stimulusName}`);
  }

  public getFixationPoints(user: User, stimulus: string) {
    const fixed_timestamp_start = 0;
    const fixed_timestamp_end = 10000000;
    const station = stimulus.split('_')[1];
    // TODO make this line shorter
    // tslint:disable-next-line:max-line-length
    const endpoint = `${this.baseUrl}/all_fixations/user=${user.getUserId()}/station=${station}/from=${fixed_timestamp_start}-to=${fixed_timestamp_end}`;
    return this.http.get(endpoint);
  }

}
