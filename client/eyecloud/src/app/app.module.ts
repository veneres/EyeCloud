import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { AppComponent } from './app.component';
import { AttentionCloudComponent } from './attention-cloud/attention-cloud.component';
import { AttentionHeatmapComponent } from './attention-heatmap/attention-heatmap.component';
import { HttpClientModule } from '@angular/common/http';
import { RandomPosDirective } from './random-pos.directive';
import { OptionsComponent } from './options/options.component';



@NgModule({
  declarations: [
    AppComponent,
    AttentionCloudComponent,
    AttentionHeatmapComponent,
    RandomPosDirective,
    OptionsComponent
  ],
  imports: [
    BsDropdownModule.forRoot(),
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
