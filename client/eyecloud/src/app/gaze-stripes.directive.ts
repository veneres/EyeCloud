import {Directive, Input, OnChanges} from '@angular/core';
import * as d3 from "d3";
import {FixationPoint} from "./classes/FixationPoint";

@Directive({
  selector: '[appGazeStripes]'
})
export class GazeStripesDirective implements OnChanges{
  @Input() userFixationData;
  @Input() imageUrl; string;
  @Input() imageWidth: number;
  @Input() imageHeight: number;
  @Input() scaleValue: number;

  constructor() { }

  ngOnChanges() {
    const container = d3.select('#container-gaze-stripes');
    const width = this.scaleValue;
    const height = this.scaleValue;

    // reset svg
    container.selectAll('*').remove();
    if (this.userFixationData === undefined) {
      return;
    }

    for (let key in this.userFixationData) {
      if (this.userFixationData.hasOwnProperty(key)) {
        let fixations = this.userFixationData[key];
        this.generateGazeStripesForUser(key, fixations, container, width, height);
      }
    }

  }

  private generateGazeStripesForUser(user: string, fixationData: FixationPoint[], container, width: number, height: number) {
    container.append('svg')
    .attr('id', 'user_' + user)
    .attr('width', width * fixationData.length)
    .attr('height', height);

    // create note data from thumbnail data
    let nodeData = [];

    for (let i = 0; i < fixationData.length; i++) {
      const fixation = fixationData[i];
      nodeData.push({
        'name': i, 'shiftX': fixation.getX(), 'shiftY': fixation.getY()
      });
    }

    // create pattern for each thumbnail
    const svg = d3.select('#user_' + user);
    const defs = svg.append('defs')
      .selectAll('pattern')
      .data(nodeData)
      .enter()
      .append('pattern')
      .attr('width', 1)
      .attr('height', 1)
      .attr('id', function (d) {
        return 'user_' + user + '_pattern_' + d.name;
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
    svg.append('text').attr('x', 0).attr('y', Math.floor(height * 0.6))
      .attr('font-size', Math.floor(height * 0.6) + 'px')
      .attr('font-family', "sans-serif")
      .attr('fill', 'black')
      .text(user);
    svg.selectAll('rect').data(nodeData)
      .enter().append('rect')
      .attr('height', height)
      .attr('width', width)
      .attr('x', function(d) { return (parseInt(d.name) + 1) * width; })
      .attr('y', 0 )
      .attr('fill', function (d) {
        return 'url(#user_' + user + '_pattern_' + d.name + ')';
      })
  }
}
