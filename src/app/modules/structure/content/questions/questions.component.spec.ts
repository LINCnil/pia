import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { StructureModule } from 'src/app/modules/structure/structure.module';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import {
  ComponentTestData,
  createComponentTestData,
} from 'src/app/testing/component-test-data';
import {
  mockComponentServices,
  setComponentTestRoute,
} from 'src/app/testing/component-test-services';
import { QuestionsComponent } from './questions.component';

describe('QuestionsComponent', () => {
  let component: QuestionsComponent;
  let fixture: ComponentFixture<QuestionsComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'AnswerStructureService',
      'DialogService',
      'GlobalEvaluationService',
      'KnowledgeBaseService',
      'SidStatusService',
      'StructureService'
    );
    await TestBed.configureTestingModule({
      imports: [
        StructureModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(QuestionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('structure', data.structure);
    fixture.componentRef.setInput('question', data.question);
    fixture.componentRef.setInput('item', data.item);
    fixture.componentRef.setInput('section', data.section);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('opens the template editor when PIA answer editing is disabled', fakeAsync(() => {
    const evaluationService = TestBed.inject(GlobalEvaluationService);
    evaluationService.answerEditionEnabled = false;
    const loadEditor = spyOn(component, 'loadEditor');

    component.questionContentFocusIn();
    tick();

    expect(loadEditor).toHaveBeenCalled();
    expect(evaluationService.answerEditionEnabled).toBeFalse();
  }));

  it('does not open the editor for an example template', fakeAsync(() => {
    component.structure.is_example = true;
    const loadEditor = spyOn(component, 'loadEditor');

    component.questionContentFocusIn();
    tick();

    expect(loadEditor).not.toHaveBeenCalled();
  }));
});
