import { Injectable } from '@angular/core';
import { User } from './classes/User';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as Rx from 'rxjs';
import { Url } from 'url';
import { DisplayConfiguration } from './classes/DisplayConfiguration';
import {Point} from './classes/Utilities';

class HeatmapRequest {
  users: User[];
  timeStampStart: number;
  timeStampStop: number;
  constructor(users: User[], timeStampStart: number, timeStampStop: number) {
    this.users = users;
    this.timeStampStart = timeStampStart;
    this.timeStampStop = timeStampStop;
  }
}


@Injectable({
  providedIn: 'root',
})
export class AttentionCloudService {
  baseUrl = 'http://127.0.0.1:5000';
  private postHeader = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  private commonConfBehavior = new Rx.BehaviorSubject(undefined);
  currentConf = this.commonConfBehavior.asObservable();
  private selectedPoint = new Rx.BehaviorSubject(undefined);
  currentSelectedPoint = this.selectedPoint.asObservable();

  constructor(private http: HttpClient) {

  }
  public changeDisplayConf(conf: DisplayConfiguration) {
    this.commonConfBehavior.next(conf);
  }
  public changeSelectedPoint(point: Point) {
    this.selectedPoint.next(point);
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

  public getHeatMap(users: User[], timeStampStart: number, timeStampStop: number, stimulus: string) {
    const stimulusNameCleaned = stimulus.substring(0, stimulus.length - 4);
    const endpoint = `${this.baseUrl}/heatmap/stimulus=${stimulusNameCleaned}`;
    const heatmapReq = new HeatmapRequest(users, timeStampStart, timeStampStop);
    return this.http.post(endpoint, heatmapReq, this.postHeader);
  }

  public getMinAndMaxTimestamp(stimulus: string, users: User[]) {
    const stimulusNameCleaned = stimulus.substring(0, stimulus.length - 4);
    const endpoint = `${this.baseUrl}/timestamp/stimulus=${stimulusNameCleaned}`;
    return this.http.post(endpoint, users, this.postHeader);
  }

}
