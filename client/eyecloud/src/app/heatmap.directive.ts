import { Directive, OnChanges, ElementRef, AfterViewInit, Input } from '@angular/core';
import { AttentionCloudService } from './attention-cloud.service';
import * as d3 from 'd3';
import { User } from './classes/User';

@Directive({
  selector: '[appHeatmap]'
})
export class HeatmapDirective implements AfterViewInit, OnChanges {

  @Input() stimulusUrl: string;
  @Input() show: boolean;
  @Input() usersIdsJSON: string;
  @Input() stimulusName: string;
  private usersIds: User[];
  constructor(private el: ElementRef, private attentionCloudService: AttentionCloudService) {
  }
  width: number;

  ngAfterViewInit(): void {
    const rawElement = this.el.nativeElement;
    const positionInfo = rawElement.getBoundingClientRect();
    this.width = positionInfo.width;
  }

  ngOnChanges(): void {
    // Nothing to show, so return
    if (!this.show) {
      return;
    }
    console.log(this);
    // parsing usersids, because it's only possibile to pass string to a directive
    this.usersIds = JSON.parse(this.usersIdsJSON);
    this.attentionCloudService.getHeatMap(this.usersIds[0], this.stimulusName).subscribe((dataset) => {
      // We append the canvas in this phase to accelerate the rendering process
      // remove the canvas if it's present
      // Append the canvas
      const canvas = d3.select(this.el.nativeElement).select('canvas')
        .node();
      const canvasWidth = dataset['width'];
      const canvasHeight = dataset['height'];
      // ignore the warning on the next line for calling getContext on type BaseType
      const ctx = (canvas as HTMLCanvasElement).getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      const buf = new ArrayBuffer(imageData.data.length);
      const buf8 = new Uint8ClampedArray(buf);
      const data = new Uint32Array(buf);
      if (dataset.hasOwnProperty('height') && dataset.hasOwnProperty('width')) {
        d3.select(this.el.nativeElement).select('canvas')
          .attr('width', dataset['width'])
          .attr('height', dataset['height']);
      } else {
        return;
      }
      for (let y = 0; y < canvasHeight; ++y) {
        for (let x = 0; x < canvasWidth; ++x) {
          // If there is something to draw
          if (dataset['points'].hasOwnProperty(y)) {
            if (dataset['points'][y].hasOwnProperty(x)) {
              const value = dataset['points'][y][x];
              data[y * canvasWidth + x] =
                // tslint:disable-next-line:no-bitwise
                (200 << 24) |    // alpha
                // tslint:disable-next-line:no-bitwise
                (value[2] / 2 << 16) |    // blue
                // tslint:disable-next-line:no-bitwise
                (value[1] << 8) |    // green
                value[0];
            }
          }
          // red
        }
      }

      imageData.data.set(buf8);

      ctx.putImageData(imageData, 0, 0);
    });


  }

}
