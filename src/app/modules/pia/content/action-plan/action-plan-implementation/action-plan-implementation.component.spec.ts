import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionPlanImplementationComponent } from './action-plan-implementation.component';

describe('ActionPlanImplementationComponent', () => {
  let component: ActionPlanImplementationComponent;
  let fixture: ComponentFixture<ActionPlanImplementationComponent>;

  beforeEach(async(() => {
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
