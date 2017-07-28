import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionPlanGraphComponent } from './action-plan-graph.component';

describe('ActionPlanGraphComponent', () => {
  let component: ActionPlanGraphComponent;
  let fixture: ComponentFixture<ActionPlanGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionPlanGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionPlanGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
