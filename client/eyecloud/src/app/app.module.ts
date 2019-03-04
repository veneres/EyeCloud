import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { AttentionCloudComponent } from './attention-cloud/attention-cloud.component';
import { AttentionHeatmapComponent } from './attention-heatmap/attention-heatmap.component';


@NgModule({
  declarations: [
    AppComponent,
    AttentionCloudComponent,
    AttentionHeatmapComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
