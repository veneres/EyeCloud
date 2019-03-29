import { TestBed, inject } from '@angular/core/testing';

import { AttentionCloudService } from './attention-cloud.service';

describe('AttentionCloudService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AttentionCloudService]
    });
  });

  it('should be created', inject([AttentionCloudService], (service: AttentionCloudService) => {
    expect(service).toBeTruthy();
  }));
});
