import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttentionDataComponent } from './attention-data.component';

describe('AttentionDataComponent', () => {
  let component: AttentionDataComponent;
  let fixture: ComponentFixture<AttentionDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttentionDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttentionDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
