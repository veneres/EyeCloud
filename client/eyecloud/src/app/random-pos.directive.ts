import { Directive, ElementRef, Input, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import { Thumbnail } from './attention-cloud/classes/Thumbnail';

@Directive({
  selector: '[appRandomPos]'
})

export class RandomPosDirective implements OnChanges {
  @Input() thumbnailData: Thumbnail[];
  @Input() imageUrl; string;
  @Input() imageWidth: number;
  @Input() imageHeight: number;
  @Input() representation: string;

  ngOnChanges() {

    const multiplier = 2;

    console.log(this.thumbnailData);
    const svg = d3.select('svg');

    // reset svg
    svg.selectAll('*').remove();

    // add background color
    // svg.append('rect').
    // attr('height', '100%').
    // attr('width', '100%').
    // attr('fill', 'lightblue');

    // create note data from thumbnail data
    const nodeData = [];
    if (this.thumbnailData === undefined) {
      return;
    }
    for (let i = 0; i < this.thumbnailData.length; i++) {
      const thumbnail = this.thumbnailData[i];
      nodeData.push({
        'name': thumbnail.id, 'r': thumbnail.croppingSize * multiplier,
        'x': thumbnail.positionX, 'y': thumbnail.positionY,
        'shiftX': thumbnail.styleX, 'shiftY': thumbnail.styleY
      });
    }

    // create pattern for each thumbnail
    const defs = svg.append('defs')
      .selectAll('pattern')
      .data(nodeData)
      .enter()
      .append('pattern')
      .attr('width', function (d) { return d.r / multiplier; })
      .attr('height', function (d) { return d.r / multiplier; })
      .attr('patternTransform', function (d) {
        return 'translate(' + -d.shiftX + ',' + -d.shiftY + ')';
      })
      .attr('id', function (d) {
        return 'pattern_' + d.name;
      });

    // add background image for cropping
    defs.append('image')
      .attr('xlink:href', this.imageUrl)
      .attr('width', this.imageWidth)
      .attr('height', this.imageHeight);

    // produce forces
    const attractForce = d3.forceManyBody().strength(50);

    let collisionForce;
    if (this.representation === 'circular') {
      collisionForce = d3.forceCollide().radius(function (d: any) {
        return d.r / 2 + 1;
      }).iterations(100);
    } else {
      collisionForce = d3.forceCollide().radius(function (d: any) {
        return d.r / 2 * Math.sqrt(2) + 1;
      }).iterations(100);
    }

    // force simulation
    const simulation = d3.forceSimulation(nodeData).alphaDecay(0.01)
      .force('attractForce', attractForce)
      .force('collisionForce', collisionForce)
      .force('center', d3.forceCenter(400, 300));

    // produce nodes from node data
    let node;
    if (this.representation === 'circular') {
      node = svg.selectAll('circle').data(nodeData)
        .enter().append('circle')
        .attr('r', function (d) { return d.r / 2; })
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('fill', function (d) {
          return 'url(#pattern_' + d.name + ')';
        })
        .attr('stroke', 'gray')
        .attr('stroke-width', '2')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));
    } else {
      node = svg.selectAll('rect').data(nodeData)
        .enter().append('rect')
        .attr('height', function (d) { return d.r; })
        .attr('width', function (d) { return d.r; })
        .attr('x', function (d) { return d.x; })
        .attr('y', function (d) { return d.y; })
        .attr('fill', function (d) {
          return 'url(#pattern_' + d.name + ')';
        })
        .attr('stroke', 'gray')
        .attr('stroke-width', '2')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));
    }

    function dragstarted(d) {
      simulation.restart();
      simulation.alpha(0.7);
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      d.fx = null;
      d.fy = null;
      simulation.alphaTarget(0.1);
    }

    function tickedCircle() {
      node.attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    }

    function tickedSquare() {
      node.attr('x', function (d) { return d.x; })
        .attr('y', function (d) { return d.y; });
    }

    // start simulation
    if (this.representation === 'circular') {
      simulation.on('tick', tickedCircle);
    } else {
      simulation.on('tick', tickedSquare);
    }
  }
  constructor(private el: ElementRef) { }


}


