import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttentionCloudComponent } from './attention-cloud.component';

describe('AttentionCloudComponent', () => {
  let component: AttentionCloudComponent;
  let fixture: ComponentFixture<AttentionCloudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttentionCloudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttentionCloudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
