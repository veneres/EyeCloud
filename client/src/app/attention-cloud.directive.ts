import { Directive, Input, ElementRef, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import { Thumbnail } from './classes/Thumbnail';
import { Point } from './classes/Utilities';
import { AttentionCloudService } from './attention-cloud.service';

@Directive({
  selector: '[appAttentionCloud]'
})

export class AttentionCloudDirective implements OnChanges {
  @Input() thumbnailData: Thumbnail[];
  @Input() imageUrl; string;
  @Input() imageWidth: number;
  @Input() imageHeight: number;
  @Input() selectedPoint: Point;
  @Input() linkWidth: number;
  private oldThumbnailData: Thumbnail[];
  private oldSelectedId: any;

  constructor(private attentionCloudService: AttentionCloudService) { }

  ngOnChanges() {
    if (this.selectedPoint) {
      let selectedId;
      let max_distance;
      // find the nearest thumbnail from the selected point
      this.thumbnailData.forEach((thumbnail) => {
        const distance = ((this.selectedPoint.x - thumbnail.styleX) ** 2) + ((this.selectedPoint.y - thumbnail.styleY) ** 2);
        if (max_distance === undefined || distance < max_distance) {
          max_distance = distance;
          selectedId = thumbnail.id;
        }
      });
      if (this.oldThumbnailData !== undefined && this.oldThumbnailData === this.thumbnailData) {
        if (this.oldSelectedId !== undefined) {
          d3.select(`#thumbnail-${this.oldSelectedId}`).attr('stroke', 'gray').attr('stroke-width', '2');
        }
        d3.select(`#thumbnail-${selectedId}`).attr('stroke', 'red').attr('stroke-width', '4');
        this.oldSelectedId = selectedId;
      }
    } else {

      this.oldThumbnailData = this.thumbnailData;
      const svg = d3.select('#svg-attention-cloud');
      const width = parseInt(svg.attr('width'), 10);
      const height = parseInt(svg.attr('height'), 10);

      // reset svg
      svg.selectAll('*').remove();

      // create note data from thumbnail data
      const nodeData = [];
      if (this.thumbnailData === undefined) {
        return;
      }
      for (let i = 0; i < this.thumbnailData.length; i++) {
        const thumbnail = this.thumbnailData[i];
        nodeData.push({
          'name': thumbnail.id, 'r': Math.round(thumbnail.croppingSize),
          'x': thumbnail.positionX, 'y': thumbnail.positionY,
          'shiftX': thumbnail.styleX, 'shiftY': thumbnail.styleY,
          'selected': thumbnail.selected
        });
      }

      // convert color to hex code
      const rgbToHex = function (rgb) {
        let hex = Number(rgb).toString(16);
        if (hex.length < 2) {
          hex = "0" + hex;
        }
        return hex;
      };

      const fullColorHex = function(r, g, b) {
        let red = rgbToHex(r);
        let green = rgbToHex(g);
        let blue = rgbToHex(b);
        return red + green + blue;
      };

      const idToColor = function(ratio) {
        let red = 0, green = 0, blue = 0;
        // 3 quadrants: (255, 0, 0) -> (128, 0, 255) -> (0, 255, 255) -> (128, 255, 0)
        if (ratio >= 0 && ratio < 0.3) {
          red = (1 - ratio / 0.3) * (255 - 128) + 128;
          green = 0;
          blue = (ratio / 0.3) * 255;
        }
        else if (ratio >= 0.3 && ratio < 0.65) {
          red = (1 - (ratio - 0.3) / 0.35) * 128;
          green = (ratio - 0.3) / 0.35 * 255;
          blue = 255;
        }
        else if (ratio >= 0.65 && ratio <= 1) {
          red = (ratio - 0.65) / 0.35 * 128;
          green = 255;
          blue = (1 - (ratio - 0.65) / 0.35) * 255;
        }
        return fullColorHex(Math.round(red), Math.round(green), Math.round(blue));
      };

      // create link data from thumbnail data if showLinks is true
      const linkData = [];
      const sortedThumbnails = Thumbnail.sortThumbnailsByTimestamp(this.thumbnailData);
      const totalSize = sortedThumbnails.length;
      for (let i = 0; i < totalSize - 1; i++) {
        const thumbnail = sortedThumbnails[i];
        const nextThumbnail = sortedThumbnails[i + 1];
        let opacity = (1 - (i + 1) / totalSize) * 0.5 + 0.5;
        let color = '#' + idToColor(i / totalSize);
        linkData.push({
          'id': i,
          'source': thumbnail.id,
          'target': nextThumbnail.id,
          'linewidth': this.linkWidth,
          'lineopacity': opacity,
          'linecolor': color,
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
          return 'pattern_' + d.name;
        });

      // add background image for cropping
      defs.append('image')
        .attr('xlink:href', this.imageUrl)
        .attr('width', this.imageWidth)
        .attr('height', this.imageHeight)
        .attr('transform', function (d) {
          return 'translate(' + (-d.shiftX + d.r / 2) + ',' + (-d.shiftY + d.r / 2) + ')';
        });

      this.generateForceSimulation(svg, nodeData, linkData, width, height);
    }

  }

  private generateForceSimulation(svg, nodeData, linkData, width, height) {

    // produce forces
    const attractForce = d3.forceManyBody().strength(50);

    const collisionForce = d3.forceCollide().radius(function (d: any) {
      return d.r / 2 * 1.1;
    }).iterations(10);

    // force simulation
    const simulation = d3.forceSimulation(nodeData).alphaDecay(0.1)
      .force("link", d3.forceLink().links(linkData).strength(0.5).distance(0.5))
      .force('attractForce', attractForce)
      .force('collisionForce', collisionForce)
      .force('center', d3.forceCenter(width / 2, height / 2));

    // produce links from link data
    // must produce links before nodes to make sure links appear behind thumbnails
    const link = svg.selectAll("line").data(linkData)
      .enter().append('line')
      .attr("stroke", d => d.linecolor)
      .attr("stroke-opacity", d => d.lineopacity)
      .attr("stroke-width", d => d.linewidth)
      .attr('id', function (d) { return 'link-' + d.id; });

    // produce nodes from node data
    const node = svg.selectAll('circle').data(nodeData)
      .enter().append('circle')
      .attr('r', function (d) { return d.r / 2; })
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; })
      .attr('fill', function (d) {
        return 'url(#pattern_' + d.name + ')';
      })
      .attr('id', function (d) { return 'thumbnail-' + d.name; })
      .attr('stroke', 'gray')
      .attr('stroke-width', '2')
      .on('click', (d) => {
        this.attentionCloudService.changeSelectedPoint(new Point(d.shiftX, d.shiftY));
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function ticked() {
      // update link positions
      link
        .attr("x1", d => { return Math.max(0, Math.min(width, d.source.x)); })
        .attr("y1", d => { return Math.max(0, Math.min(height, d.source.y)); })
        .attr("x2", d => { return Math.max(0, Math.min(width, d.target.x)); })
        .attr("y2", d => { return Math.max(0, Math.min(height, d.target.y)); });

      // update node positions
      node
        .attr('cx', function (d) {
          let newX = Math.max(d.r / 2, Math.min(width - d.r / 2, d.x));
          return isNaN(newX) ? width / 2 : newX;
      }).attr('cy', function (d) {
        let newY = Math.max(d.r / 2, Math.min(height - d.r / 2, d.y));
        return isNaN(newY) ? height / 2 : newY;
      });
    }

    // start simulation
    simulation.on('tick', ticked);
  }
}


