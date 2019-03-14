import { Directive, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
@Directive({
  selector: '[appRandomPos]'
})
export class RandomPosDirective {
  @Input() posX: string;
  @Input() posY: string;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    d3.select(this.el.nativeElement).attr('x', this.posX);
    d3.select(this.el.nativeElement).attr('y', this.posY);
  }

}
