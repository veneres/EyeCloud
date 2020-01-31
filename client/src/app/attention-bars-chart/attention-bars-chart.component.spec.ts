import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttentionBarsChartComponent } from './attention-bars-chart.component';

describe('AttentionBarsChartComponent', () => {
  let component: AttentionBarsChartComponent;
  let fixture: ComponentFixture<AttentionBarsChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttentionBarsChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttentionBarsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
