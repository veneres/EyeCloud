import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GazeStripesComponent } from './gaze-stripes.component';

describe('GazeStripesComponent', () => {
  let component: GazeStripesComponent;
  let fixture: ComponentFixture<GazeStripesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GazeStripesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GazeStripesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
