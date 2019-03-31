import { Directive, Input, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import { FixationPoint } from './classes/FixationPoint';
import { Point } from './classes/Utilities';
import { AttentionCloudService } from './attention-cloud.service';

@Directive({
  selector: '[appGazeStripes]'
})
export class GazeStripesDirective implements OnChanges {

  maxTimestamp = 0;

  @Input() userFixationData;
  @Input() user: string;
  @Input() imageUrl; string;
  @Input() imageWidth: number;
  @Input() imageHeight: number;
  @Input() scaleValue: number;
  @Input() granularity: number;
  @Input() minDuration: number;

  constructor(private attentionCloudService: AttentionCloudService) { }

  ngOnChanges() {
    const container = d3.select('#gaze-stripe-' + this.user);
    const width = this.scaleValue;
    const height = this.scaleValue;

    // reset svg
    container.selectAll('*').remove();

    if (this.userFixationData === undefined) {
      return;
    }
    if (this.userFixationData[this.user] === undefined) {
      return;
    }
    const fixationData = this.granularity === 0 ? this.userFixationData[this.user]
    : this.processData(this.userFixationData[this.user]);
    const leng = this.userFixationData[this.user].length - 1;
    const lastFixation = this.userFixationData[this.user][leng];
    this.maxTimestamp = this.granularity === 0 ? parseInt(lastFixation.getTimestamp(), 10) + parseInt(lastFixation.getDuration(), 10)
    : this.maxTimestamp;
    this.generateGazeStripesForUser(this.user, fixationData, container, width, height)
  }

  private processData(fixations: FixationPoint[]) {
    if (fixations === undefined) {
      return undefined;
    }
    const newFixations = [];
    let sum = 0;
    let offset = 0;
    for (let i = 0; i < fixations.length; i++) {
      const rep = Math.ceil((parseInt(fixations[i].getDuration(), 10) - offset) / this.granularity);
      offset = rep * this.granularity - parseInt(fixations[i].getDuration(), 10);
      for (let j = 0; j < rep; j++) {
        newFixations.push(fixations[i]);
      }
      sum += rep * this.granularity;
    }
    this.maxTimestamp = sum;
    return newFixations;
  }

  private generateGazeStripesForUser(user: string, fixationData: FixationPoint[], container, width: number, height: number) {

    if (fixationData === undefined || fixationData.length <= 0) { return; }

    // remove scroll-bar
    d3.selectAll('.drag-scroll-content').style('overflow', 'hidden');

    // create svg
    container.append('svg')
      .attr('id', 'user_' + user)
      .attr('width', width * fixationData.length)
      .attr('height', height + height / 2 + 10);

    const svg = d3.select('#user_' + user);

    // create note data from thumbnail data
    const nodeData = [];

    for (let i = 0; i < fixationData.length; i++) {
      const fixation = fixationData[i];
      nodeData.push({
        'name': i, 'shiftX': fixation.getX(), 'shiftY': fixation.getY()
      });
    }

    // create pattern for each thumbnail
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
        return 'translate(' + (-d.shiftX + width / 2) + ',' + (-d.shiftY + height / 2) + ')';
      });

    // create axis of timeline
    const minTimestamp = parseInt(fixationData[0].getTimestamp(), 10);
    const xScale = d3.scaleLinear().domain([minTimestamp, this.maxTimestamp]).range([0, width * fixationData.length]);
    const tickRange = [];
    const tickStep = this.granularity !== 0 ? Math.ceil(this.granularity * 3 / this.minDuration) * 50
    :1000;
    d3.range(Math.ceil(this.maxTimestamp / tickStep)).forEach(n => {
      tickRange.push(n * tickStep);
    });
    const xAxis =  d3.axisBottom(xScale).tickValues(tickRange);
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

    let gSize = height / 2;
    if (gSize < 7) {
      gSize = 7;
    }
    if (gSize > 30) {
      gSize = 30;
    }
    svg.select('g')
      .attr('size', gSize)
      .attr('font-size', gSize);

    // produce gaze stripe
    svg.selectAll('rect').data(nodeData)
      .enter().append('rect')
      .attr('height', height)
      .attr('width', width)
      .attr('x', function (d) { return parseInt(d.name, 10) * width; })
      .attr('y', 0)
      .attr('fill', function (d) {
        return 'url(#user_' + user + '_pattern_' + d.name + ')';
      })
      .attr('stroke', 'gray')
      .attr('stroke-width', '1')
      .on('click', (d) => {
        this.attentionCloudService.changeSelectedPoint(new Point(d.shiftX, d.shiftY));
      });
  }
}
