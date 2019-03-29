import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttentionHeatmapComponent } from './attention-heatmap.component';

describe('AttentionHeatmapComponent', () => {
  let component: AttentionHeatmapComponent;
  let fixture: ComponentFixture<AttentionHeatmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttentionHeatmapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttentionHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
