import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppComponent } from './app.component';
import { AttentionCloudComponent } from './attention-cloud/attention-cloud.component';
import { AttentionHeatmapComponent } from './attention-heatmap/attention-heatmap.component';
import { Ng5SliderModule } from 'ng5-slider';
import { HttpClientModule } from '@angular/common/http';
import { RandomPosDirective } from './random-pos.directive';
import { OptionsComponent } from './options/options.component';
import { HeatmapDirective } from './heatmap.directive';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent,
    AttentionCloudComponent,
    AttentionHeatmapComponent,
    RandomPosDirective,
    OptionsComponent,
    HeatmapDirective
  ],
  imports: [
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    BrowserModule,
    HttpClientModule,
    FormsModule,
    Ng5SliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
