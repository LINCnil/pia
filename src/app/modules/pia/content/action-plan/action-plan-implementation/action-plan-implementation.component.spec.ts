import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActionPlanImplementationComponent } from './action-plan-implementation.component';

describe('ActionPlanImplementationComponent', () => {
  let component: ActionPlanImplementationComponent;
  let fixture: ComponentFixture<ActionPlanImplementationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionPlanImplementationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionPlanImplementationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
