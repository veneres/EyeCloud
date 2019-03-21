import {Directive, Input, OnChanges} from '@angular/core';
import {Thumbnail} from "./attention-cloud/classes/Thumbnail";
import * as d3 from "d3";
import {FixationPoint} from "./classes/FixationPoint";

@Directive({
  selector: '[appGazeStripes]'
})
export class GazeStripesDirective implements OnChanges{
  @Input() fixationData: FixationPoint[];
  @Input() imageUrl; string;
  @Input() imageWidth: number;
  @Input() imageHeight: number;

  constructor() { }

  ngOnChanges() {
    const svg = d3.select('#svg-gaze-stripes');
    const height = 30;
    const width = 30;
    const numUsers = 1;

    // reset svg
    svg.selectAll('*').remove();

    // add background color
    // svg.append('rect').
    // attr('height', '100%').
    // attr('width', '100%').
    // attr('fill', 'lightblue');

    // create note data from thumbnail data
    const nodeData = [];
    if (this.fixationData === undefined) {
      return;
    }
    for (let i = 0; i < this.fixationData.length; i++) {
      const fixation = this.fixationData[i];
      nodeData.push({
        'name': i, 'shiftX': fixation.getX(), 'shiftY': fixation.getY()
      });
    }

    svg.attr('width', width * nodeData.length);
    svg.attr('height', height * numUsers);

    // create pattern for each thumbnail
    const defs = svg.append('defs')
      .selectAll('pattern')
      .data(nodeData)
      .enter()
      .append('pattern')
      .attr('width', 1)
      .attr('height', 1)
      .attr('id', function (d) {
        return 'pattern_' + d.name;
      });

    // add background image for cropping
    defs.append('image')
      .attr('xlink:href', this.imageUrl)
      .attr('width', this.imageWidth)
      .attr('height', this.imageHeight)
      .attr('transform', function (d) {
        return 'translate(' + -d.shiftX + ',' + -d.shiftY + ')';
      });

    // produce nodes from node data
    svg.selectAll('rect').data(nodeData)
      .enter().append('rect')
      .attr('height', height)
      .attr('width', width)
      .attr('x', function(d) { return parseInt(d.name) * width; })
      .attr('y', 0 )
      .attr('fill', function (d) {
        return 'url(#pattern_' + d.name + ')';
      })
  }
}
