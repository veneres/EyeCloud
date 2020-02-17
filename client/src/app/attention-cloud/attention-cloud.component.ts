import { Component, OnInit} from '@angular/core';
import { Thumbnail } from '../classes/Thumbnail';
import { FixationPoint } from '../classes/FixationPoint';
import { User } from '../classes/User';
import { AttentionCloudService } from '../attention-cloud.service';
import { DisplayConfiguration } from '../classes/DisplayConfiguration';
import { Utilities } from '../classes/Utilities';
import { Options } from 'ng5-slider';
import { Point } from '../classes/Utilities';
import { Pixel } from '../attention-cloud.service'

@Component({
  selector: 'app-attention-cloud',
  templateUrl: './attention-cloud.component.html',
  styleUrls: ['./attention-cloud.component.css']
})
export class AttentionCloudComponent implements OnInit {
  thumbnails: Thumbnail[];
  private fixationPoints: FixationPoint[];
  timestampStart: number;
  timestampStop: number;
  imageURL: string;
  imageWidth: number;
  imageHeight: number;
  displayComponent = false;
  private stimulusName: string;
  private userIds: User[];
  maxCroppingSizeValue = 100;
  maxCroppingSizeOptions: Options = {
    floor: 70,
    ceil: 120,
    step: 5,
    showSelectionBar: true,
  };
  minCroppingSizeValue = 20;
  minCroppingSizeOptions: Options = {
    floor: 10,
    ceil: 30,
    step: 5,
    showSelectionBar: true,
  };
  numPointsValue = 20;
  numPointsOptions: Options = {
    floor: 10,
    ceil: 300,
    step: 5,
    showSelectionBar: true,
  };
  clusterRadiusValue = 0;
  clusterRadiusOptions: Options = {
    floor: 0,
    ceil: 500,
    step: 10,
    showSelectionBar: true,
  };
  linkWidth = 5;
  linkWidthOptions: Options = {
    floor: 0,
    ceil: 20,
    step: 2,
    showSelectionBar: true,
  };
  selectedPoint: Point;
  numCluster = 1;
  numClusterOptions: Options = {
    floor: 1,
    ceil: 10,
    step: 1,
    showSelectionBar: true,
  };
  numClusterForDirective = 1;
  clusterReady = false;

  constructor(private attentionCloudService: AttentionCloudService) {
    this.selectedPoint = undefined;
  }

  private clusterThumbnailsByRgb(thumbnails: Thumbnail[], numClusters: number, numIterations: number) {
    // helper function to get distance
    let getDistance = function(x, y) {
      let sum = 0;
      for (let i = 0; i < x.length; i++) {
        sum += Math.pow(x[i] - y[i], 2);
      }
      return Math.sqrt(sum);
    };

    // initialize centroids to random, and clusters to empty
    let centroids = new Array(numClusters);
    for (let i = 0; i < numClusters; i++) {
      centroids[i] = thumbnails[Math.floor(Math.random() * (thumbnails.length - 1))].rgbDistribution;
    }

    for (let i = 0; i < numIterations; i++) {
      // assign thumbnails to clusters
      thumbnails.forEach(thumbnail => {
        let nearestCentroidIndex = 0;
        let counter = 0;
        centroids.forEach(x => {
          if (getDistance(x, thumbnail.rgbDistribution) < getDistance(centroids[nearestCentroidIndex], thumbnail.rgbDistribution)) {
            nearestCentroidIndex = counter;
          }
          counter++;
        });
        thumbnail.updateRgbCluster(nearestCentroidIndex);
      });

      // update centroids by mean distances of points
      let sum_centroids = [];
      for (let k = 0; k < numClusters; k++) {
        sum_centroids.push([0, 0, 0]);
      }
      let count = new Array(numClusters).fill(0);
      thumbnails.forEach(thumbnail => {
        for (let n = 0; n < 3; n++) {
          sum_centroids[thumbnail.rgbCluster][n] = sum_centroids[thumbnail.rgbCluster][n] + thumbnail.rgbDistribution[n];
        }
        count[thumbnail.rgbCluster]++;
      });
      for (let n = 0; n < numClusters; n++) {
        if (count[n] > 0) {
          for (let k = 0; k < 3; k++) {
            centroids[n][k] = sum_centroids[n][k] / count[n];
          }
        }
      }
    }

    return thumbnails;
  }

  private updateThumbnails() {
    this.clusterReady = false;
    const aggregateFixationPoints = Utilities.clusterFixationPoints(this.fixationPoints, this.clusterRadiusValue);
    this.thumbnails = Thumbnail.get_thumbnails_for_attention_cloud(aggregateFixationPoints,
      this.maxCroppingSizeValue, this.minCroppingSizeValue, this.numPointsValue);
    // update thumbnails' rgb distribution
    const pixels = [];
    this.thumbnails.forEach(thumbnail => {
      let cx = thumbnail.styleX;
      let cy = thumbnail.styleY;
      let r = thumbnail.croppingSize;
      pixels.push(new Pixel(thumbnail.id, cx - r, cy - r, cx + r, cy + r));
    });
    this.attentionCloudService.getRgbDistribution(this.stimulusName, pixels).subscribe((res: any) => {
      for (let i = 0; i < res.length; i++) {
        let rgb = [Math.floor(parseFloat(res[i].red)), Math.floor(parseFloat(res[i].green)), Math.floor(parseFloat(res[i].blue))];
        this.thumbnails[i].updateRgbDistribution(rgb);
      }
      // cluster thumbnails
      this.thumbnails = this.clusterThumbnailsByRgb(this.thumbnails, this.numCluster, 100);
      let distribution = new Array(this.numCluster).fill(0);
      this.thumbnails.forEach((elem) =>{
        distribution[elem.rgbCluster] += 1;
      })
      console.log(distribution);
      this.numClusterForDirective = this.numCluster;
      this.clusterReady = true;
    });
    this.attentionCloudService.changeCloudsVisible(this.thumbnails);
  }

  ngOnInit() {
    // the configuration are passed via this observable
    this.attentionCloudService.currentConf.subscribe((conf: DisplayConfiguration) => {
      // default and starting value
      if (conf === undefined) {
        return;
      }
      // check if all the parameters are present otherwise skip the updating
      if (conf.getUsers().length === 0 || isNaN(conf.getTimeStampStart()) || isNaN(conf.getTimeStampEnd())) {
        this.displayComponent = false;
        return;
      }
      this.stimulusName = conf.getStimulus();
      this.userIds = conf.getUsers();
      this.displayComponent = this.stimulusName !== '' && this.userIds.length > 0;
      this.timestampStart = conf.getTimeStampStart();
      this.timestampStop = conf.getTimeStampEnd();
      const fixationPoints = [];
      this.attentionCloudService.getFixationPoints(this.userIds, this.timestampStart, this.timestampStop, this.stimulusName)
        .subscribe((data) => {
          for (const fixation_n in data) {
            if (data.hasOwnProperty(fixation_n)) {
              if (data[fixation_n].mapInfo.mapName === this.stimulusName) {
                const index = data[fixation_n].fixationPoint.index;
                const x = data[fixation_n].fixationPoint.x;
                const y = data[fixation_n].fixationPoint.y;
                const duration = data[fixation_n].fixationPoint.duration;
                const timestamp = data[fixation_n].fixationPoint.timestamp;
                const user = data[fixation_n].user;
                fixationPoints.push(new FixationPoint(index, x, y, duration, timestamp, user));
              }
            }
          }
          this.fixationPoints = fixationPoints;
          this.updateThumbnails();
          this.selectedPoint = undefined;
        });
      this.imageURL = this.attentionCloudService.getStimulusURL(this.stimulusName).toString();
      this.imageWidth = conf.getStimulusWidth();
      this.imageHeight = conf.getStimulusHeight();
    });
    this.attentionCloudService.currentSelectedPoint.subscribe((point: Point) => {
      if (point === undefined) {
        return;
      }
      this.selectedPoint = point;
    });
    }

    generate() {
      this.updateThumbnails();
      this.selectedPoint = undefined;
    }
}

