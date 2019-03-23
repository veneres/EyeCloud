import { Directive, OnChanges, ElementRef, AfterViewInit, Input } from '@angular/core';
import { HeatmapService } from './heatmap.service';
import * as d3 from 'd3';

@Directive({
  selector: '[appHeatmap]'
})
export class HeatmapDirective implements AfterViewInit, OnChanges {

  @Input() dataset: any;
  @Input() show: boolean;
  constructor(private el: ElementRef, private heatmapService: HeatmapService) {
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
    // We append the canvas in this phase to accelerate the rendering process
    // remove the canvas if it's present
    // Append the canvas
    const canvas = d3.select(this.el.nativeElement).select('canvas')
      .node();
    const canvasWidth = this.dataset
    ['width'];
    const canvasHeight = this.dataset
    ['height'];
    // ignore the warning on the next line for calling getContext on type BaseType
    const ctx = (canvas as HTMLCanvasElement).getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const buf = new ArrayBuffer(imageData.data.length);
    const buf8 = new Uint8ClampedArray(buf);
    const data = new Uint32Array(buf);
    if (this.dataset
      .hasOwnProperty('height') && this.dataset
        .hasOwnProperty('width')) {
      d3.select(this.el.nativeElement).select('canvas')
        .attr('width', this.dataset
        ['width'])
        .attr('height', this.dataset
        ['height']);
    } else {
      return;
    }
    for (let y = 0; y < canvasHeight; ++y) {
      for (let x = 0; x < canvasWidth; ++x) {
        // If there is something to draw
        if (this.dataset
        ['points'].hasOwnProperty(y)) {
          if (this.dataset
          ['points'][y].hasOwnProperty(x)) {
            const value = this.dataset
            ['points'][y][x];
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
    this.heatmapService.changeDisplayLoading(false);

  }

}
