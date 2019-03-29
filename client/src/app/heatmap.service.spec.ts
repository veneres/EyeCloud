import { TestBed } from '@angular/core/testing';

import { HeatmapService } from './heatmap.service';

describe('HeatmapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HeatmapService = TestBed.get(HeatmapService);
    expect(service).toBeTruthy();
  });
});
