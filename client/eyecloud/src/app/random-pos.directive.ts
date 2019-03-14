import { Directive, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
@Directive({
  selector: '[appRandomPos]'
})
export class RandomPosDirective {
  @Input() x_1: string;
  @Input() y_1: string;

  constructor(el: ElementRef) {
    // TODO fix problem with svgWidth and svgHeight
    d3.select(el.nativeElement).attr('x', Math.random() * 600);
    d3.select(el.nativeElement).attr('y', Math.random() * 400);
  }

  private getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

}
