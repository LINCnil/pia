import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ValidatePIAComponent } from './validate-pia.component';

describe('ValidatePIAComponent', () => {
  let component: ValidatePIAComponent;
  let fixture: ComponentFixture<ValidatePIAComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidatePIAComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidatePIAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
