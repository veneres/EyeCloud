import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapInfoComponent } from './map-info.component';

describe('MapInfoComponent', () => {
  let component: MapInfoComponent;
  let fixture: ComponentFixture<MapInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
