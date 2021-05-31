import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RefusePIAComponent } from './refuse-pia.component';

describe('RefusePIAComponent', () => {
  let component: RefusePIAComponent;
  let fixture: ComponentFixture<RefusePIAComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RefusePIAComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefusePIAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
