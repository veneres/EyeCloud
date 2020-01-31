import { Injectable } from '@angular/core';
import { User } from './classes/User';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as Rx from 'rxjs';
import { Url } from 'url';
import { DisplayConfiguration } from './classes/DisplayConfiguration';
import {Point} from './classes/Utilities';
import { Thumbnail } from './classes/Thumbnail';

class FixationDataRequest {
  users: User[];
  timeStampStart: number;
  timeStampStop: number;
  constructor(users: User[], timeStampStart: number, timeStampStop: number) {
    this.users = users;
    this.timeStampStart = timeStampStart;
    this.timeStampStop = timeStampStop;
  }
}

class HeatmapRequest extends FixationDataRequest {
  visualSpan: number;
  constructor(users: User[], timeStampStart: number, timeStampStop: number, visualSpan: number) {
    super(users, timeStampStart, timeStampStop);
    this.visualSpan = visualSpan;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AttentionCloudService {
  //baseUrl = 'http://127.0.0.1:5000'; // localhost
  baseUrl = 'http://192.168.99.102:5000'; // docker machine ip
  private postHeader = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  private commonConfBehavior = new Rx.BehaviorSubject(undefined);
  currentConf = this.commonConfBehavior.asObservable();
  private selectedPoint = new Rx.BehaviorSubject(undefined);
  currentSelectedPoint = this.selectedPoint.asObservable();
  private clouds = new Rx.BehaviorSubject(undefined);
  cloudsVisible = this.clouds.asObservable();

  constructor(private http: HttpClient) {

  }
  public changeDisplayConf(conf: DisplayConfiguration) {
    this.commonConfBehavior.next(conf);
  }
  public changeSelectedPoint(point: Point) {
    this.selectedPoint.next(point);
  }
  public changeCloudsVisible(clouds: Thumbnail[]) {
    this.clouds.next(clouds);
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

  public getFixationPoints(users: User[], timeStampStart: number, timeStampStop: number, stimulus: string) {
    const fixationDataReq = new FixationDataRequest(users, timeStampStart, timeStampStop);
    const endpoint = `${this.baseUrl}/all_fixations/stimulus=${stimulus}`;
    return this.http.post(endpoint, fixationDataReq, this.postHeader);
  }

  public getGazeStripes(users: User[], timeStampStart: number, timeStampStop: number, stimulus: string) {
    const fixationDataReq = new FixationDataRequest(users, timeStampStart, timeStampStop);
    const endpoint = `${this.baseUrl}/gaze_stripes/stimulus=${stimulus}`;
    return this.http.post(endpoint, fixationDataReq, this.postHeader);
  }

  public getHeatMap(users: User[], timeStampStart: number, timeStampStop: number, stimulus: string, visualSpan: number) {
    const stimulusNameCleaned = stimulus.substring(0, stimulus.length - 4);
    const endpoint = `${this.baseUrl}/heatmap/stimulus=${stimulusNameCleaned}`;
    const heatmapReq = new HeatmapRequest(users, timeStampStart, timeStampStop, visualSpan);
    return this.http.post(endpoint, heatmapReq, this.postHeader);
  }

  public getMinAndMaxTimestamp(stimulus: string, users: User[]) {
    const stimulusNameCleaned = stimulus.substring(0, stimulus.length - 4);
    const endpoint = `${this.baseUrl}/timestamp/stimulus=${stimulusNameCleaned}`;
    return this.http.post(endpoint, users, this.postHeader);
  }

}
