import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PiaModule } from 'src/app/modules/pia/pia.module';
import {
  ComponentTestData,
  createComponentTestData,
} from 'src/app/testing/component-test-data';
import {
  mockComponentServices,
  setComponentTestRoute,
} from 'src/app/testing/component-test-services';
import { ActionPlanImplementationComponent } from './action-plan-implementation.component';

describe('ActionPlanImplementationComponent', () => {
  let component: ActionPlanImplementationComponent;
  let fixture: ComponentFixture<ActionPlanImplementationComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(data, 'EvaluationService', 'GlobalEvaluationService');
    await TestBed.configureTestingModule({
      imports: [PiaModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(ActionPlanImplementationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pia', data.pia);
    fixture.componentRef.setInput('data', {
      evaluation: data.evaluation,
      short_title: 'Test',
    });
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
