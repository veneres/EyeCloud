import { Injectable } from '@angular/core';
import { User } from './classes/User';
import { HttpClient } from '@angular/common/http';
import { Url } from 'url';

@Injectable({
  providedIn: 'root',
})
export class AttentionCloudService {
  baseUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {

  }

  public getAllStations() {
    const endpoint = `${this.baseUrl}/all_stations`;
    return this.http.get(endpoint);
  }

  public getAllUserByStimulus(stimulus: string) {
    const endpoint = `${this.baseUrl}/all_users/stimulus=${stimulus}`;
    return this.http.get(endpoint);
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

  public getHeatMap(user: User, stimulus: string) {
    const stimulusNameCleaned = stimulus.substring(0, stimulus.length - 4);
    const endpoint = `${this.baseUrl}/heatmap/stimulus=${stimulusNameCleaned}/user=${user.getUserId()}`;
    return this.http.get(endpoint);
  }

  public getMinAndMaxTimestamp(stimulus: string) {
    const stimulusNameCleaned = stimulus.substring(0, stimulus.length - 4);
    const endpoint = `${this.baseUrl}/timestamp/stimulus=${stimulusNameCleaned}`;
    return this.http.get(endpoint);
  }

}
