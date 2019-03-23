import { Injectable } from '@angular/core';
import * as Rx from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeatmapService {

  private displayLoading = new Rx.BehaviorSubject(false);
  currentDisplayLoading = this.displayLoading.asObservable();
  constructor() { }
  public changeDisplayLoading(display: boolean) {
    this.displayLoading.next(display);
  }
}
