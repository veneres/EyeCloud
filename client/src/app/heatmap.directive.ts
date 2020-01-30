import { Directive, OnChanges, ElementRef, AfterViewInit, Input } from '@angular/core';
import { HeatmapService } from './heatmap.service';
import * as d3 from 'd3';
import { Point } from './classes/Utilities';
import { AggregatedFixationPoint } from './classes/AggregatedFixationPoints';
import { Thumbnail } from './attention-cloud/classes/Thumbnail';

@Directive({
  selector: '[appHeatmap]'
})
export class HeatmapDirective implements AfterViewInit, OnChanges {

  @Input() dataset: any;
  @Input() show: boolean;
  @Input() selectedPoint: Point;
  @Input() focusMode: boolean;
  @Input() clouds: Thumbnail[];
  private canvasWidth: number;
  private canvasHeight: number;
  constructor(private el: ElementRef, private heatmapService: HeatmapService) {
  }
  width: number;

  ngAfterViewInit(): void {
    const rawElement = this.el.nativeElement;
    const positionInfo = rawElement.getBoundingClientRect();
    this.width = positionInfo.width;
  }

  private computeFocusMode() {
    const interactionCanvas = d3.select(this.el.nativeElement).select('#map-mask').node();
    const ctxInteractive = (interactionCanvas as HTMLCanvasElement).getContext('2d');
    ctxInteractive.fillStyle = "rgba(255,0,0,1)";
    for (let cloud of this.clouds) {
      ctxInteractive.beginPath();
      ctxInteractive.arc(cloud.getX(), cloud.getY(), cloud.getCroppingSize(), 0, 2 * Math.PI);
      ctxInteractive.fill();
      ctxInteractive.closePath();
    }
    ctxInteractive.globalCompositeOperation = "source-out";
    ctxInteractive.fillStyle = "rgba(255,255,255,0.95)";
    ctxInteractive.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    ctxInteractive.globalCompositeOperation = "source-over";
  }

  private highlightPoint() {
    let pointX = this.selectedPoint.x;
    let pointY = this.selectedPoint.y;
    let nearesetCloud = this.clouds[0];
    let minDistance = Math.sqrt(Math.pow(this.clouds[0].getX() - pointX, 2) + Math.pow(this.clouds[0].getY() - pointY, 2));
    for (let cloud of this.clouds) {
      let distance = Math.sqrt(Math.pow(cloud.getX() - pointX, 2) + Math.pow(cloud.getY() - pointY, 2));
      if (distance < minDistance){
        nearesetCloud = cloud;
        minDistance = distance;
      }
    }
    const interactionCanvas = d3.select(this.el.nativeElement).select('#map-mask').node();
    const ctxInteractive = (interactionCanvas as HTMLCanvasElement).getContext('2d');
    ctxInteractive.beginPath();
    ctxInteractive.arc(nearesetCloud.getX(), nearesetCloud.getY(), nearesetCloud.getCroppingSize(), 0, 2 * Math.PI);
    ctxInteractive.lineWidth = 10;
    ctxInteractive.strokeStyle = '#f44336';
    ctxInteractive.stroke();
    ctxInteractive.closePath();
  }

  ngOnChanges(): void {
    // Nothing to show, so return
    if (!this.show) {
      return;
    }

    this.canvasWidth = this.dataset
    ['width'];
    this.canvasHeight = this.dataset
    ['height'];
    // We append the canvas in this phase to accelerate the rendering process
    // remove the canvas if it's present
    // Append the canvas
    d3.select(this.el.nativeElement).select('#map-mask')
      .attr('width', this.dataset
      ['width'])
      .attr('height', this.dataset
      ['height']);
    // display the overay for the focus mode
    if (this.focusMode) {
      this.computeFocusMode();
    }
    // if a new has been selected
    if (this.selectedPoint !== undefined) {
      this.highlightPoint();
      return;
    }

    const canvas = d3.select(this.el.nativeElement).select('#heatmap')
      .node();
    // ignore the warning on the next line for calling getContext on type BaseType
    const ctx = (canvas as HTMLCanvasElement).getContext('2d');
    const imageData = ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
    const buf = new ArrayBuffer(imageData.data.length);
    const buf8 = new Uint8ClampedArray(buf);
    const data = new Uint32Array(buf);
    if (this.dataset
      .hasOwnProperty('height') && this.dataset
        .hasOwnProperty('width')) {
      d3.select(this.el.nativeElement).select('#heatmap')
        .attr('width', this.dataset
        ['width'])
        .attr('height', this.dataset
        ['height']);
    } else {
      return;
    }
    for (let y = 0; y < this.canvasHeight; ++y) {
      for (let x = 0; x < this.canvasWidth; ++x) {
        // If there is something to draw
        if (this.dataset
        ['points'].hasOwnProperty(y)) {
          if (this.dataset
          ['points'][y].hasOwnProperty(x)) {
            const value = this.dataset
            ['points'][y][x];
            data[y * this.canvasWidth + x] =
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
