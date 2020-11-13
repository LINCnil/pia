import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActionPlanComponent } from './action-plan.component';

describe('ActionPlanComponent', () => {
  let component: ActionPlanComponent;
  let fixture: ComponentFixture<ActionPlanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
