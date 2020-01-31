import { Directive, Input, ElementRef } from '@angular/core';
import { Thumbnail } from './classes/Thumbnail';
import * as d3 from 'd3';
import { AttentionCloudService } from './attention-cloud.service';
import { Point } from './classes/Utilities';

@Directive({
  selector: '[appAttentionBarsChart]'
})
export class AttentionBarsChartDirective {
  @Input() clouds: Thumbnail[];
  @Input() imageUrl;
  @Input() imageWidth;
  @Input() imageHeight;
  @Input() selectedPoint;
  constructor(private el: ElementRef, private attentionCloudService: AttentionCloudService) { }
  ngOnChanges() {
    let margin = { top: 10, right: 30, bottom: 30, left: 50 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
    let data = []
    let index = 0;
    let maxY = 0;

    var colors = d3.scaleSequential(d3.interpolateRdYlBu);

    for (let cloud of this.clouds) {
      let value = cloud.getAggregatedFixationPoint().getDuration();
      data.push({ "thumbnail": cloud, "i": index, "value": cloud.getAggregatedFixationPoint().getDuration() });
      index++;
      if (value > maxY) {
        maxY = value;
      }
    }
    data.sort((a, b) => a.value < b.value ? 1 : a.value > b.value ? -1 : 0);
    d3.select(this.el.nativeElement).selectAll("*").remove();
    let svg = d3.select(this.el.nativeElement)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
    // remove all the previous bars
    svg.selectAll("g").remove();
    svg.selectAll("rect").remove()
    let x = d3.scaleBand()
      .range([0, width])
      .padding(0.1)
      .domain(data.map(function (d) { return d.i; }));

    let y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, maxY]);   // d3.hist has to be called before the Y axis obviously


    let colorId = 0;
    // append the rectangles for the bar chart
    svg.selectAll("rect")
      .data(data)
      .enter().append("rect")
      .attr("fill", d => {
        let res = colors(colorId / data.length);
        console.log("colorID: " + colorId);
        console.log("colorID: " + colors(colorId));
        if (this.selectedPoint && d.thumbnail.getX() == this.selectedPoint.x && d.thumbnail.getY() == this.selectedPoint.y) {
          return "green";
        }
        colorId++;
        return res;
      })
      .attr("x", function (d) { return x(d.i); })
      .attr("width", x.bandwidth())
      .attr("y", function (d) { return y(d.value); })
      .attr("height", function (d) { return height - y(d.value); })
      .on('click', (d) => {
        this.attentionCloudService.changeSelectedPoint(new Point(d.thumbnail.getX(), d.thumbnail.getY()));
      });

    // add the x Axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x-axis")
      .call(d3.axisBottom(x));


    let defs = svg.append("defs").selectAll("pattern")
      .data(data)
      .enter()
      .append('pattern')
      .attr('width', 1)
      .attr('height', 1)
      .attr('id', function (d) {
        return 'pattern_axis_' + d.i;
      })

    defs.append('image')
      .attr('xlink:href', this.imageUrl)
      .attr('width', this.imageWidth)
      .attr('height', this.imageHeight)
      .attr('transform', function (d) {
        return 'translate(' + (-d.thumbnail.getX() + 5) + ',' + (-d.thumbnail.getY() + 5) + ')';
      })


    svg.selectAll(".x-axis .tick text").remove();
    svg.selectAll(".x-axis .tick line").remove();

    svg.select(".x-axis")
      .selectAll(".tick")
      .data(data)
      .attr("id", d => {
        return "data-i-" + d.i;
      })
    let xAxisWidth = (svg.select(".x-axis").node() as SVGSVGElement).getBBox().width;


    for (let cloud of data) {
      svg.select("#data-i-" + cloud.i)
        .append("rect")
        .attr("fill", d => {
          return 'url(#pattern_axis_' + cloud.i + ")";
        })
        .attr('transform', function (d) {
          return 'translate(-' + (xAxisWidth / data.length) / 2 + ', 2)';
        })
        .attr("width", xAxisWidth / data.length + "px")
        .attr("height", xAxisWidth / data.length + "px");

    }

    // add the y Axis
    svg.append("g")
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -margin.top)
      .attr("font-size", "0.75em")
      .text("Fixation duration (ms)")

  }

}
