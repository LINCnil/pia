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
import { EvaluationsComponent } from './evaluations.component';

describe('EvaluationsComponent', () => {
  let component: EvaluationsComponent;
  let fixture: ComponentFixture<EvaluationsComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'AnswerService',
      'EvaluationService',
      'GlobalEvaluationService',
      'KnowledgeBaseService',
      'LanguagesService'
    );
    await TestBed.configureTestingModule({
      imports: [PiaModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(EvaluationsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', data.item);
    fixture.componentRef.setInput('pia', data.pia);
    fixture.componentRef.setInput('section', data.section);
    fixture.componentRef.setInput('questionId', data.question.id);
    fixture.componentRef.setInput('measureId', data.measure.id);
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
