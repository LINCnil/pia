import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Answer } from 'src/app/models/answer.model';
import { AnswerService } from 'src/app/services/answer.service';
import { CommentsService } from 'src/app/services/comments.service';
import { DialogService } from 'src/app/services/dialog.service';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { MeasureService } from 'src/app/services/measures.service';
import { PiaModule } from '../../pia.module';
import { QuestionsComponent } from './questions.component';

describe('QuestionsComponent', () => {
  let component: QuestionsComponent;
  let fixture: ComponentFixture<QuestionsComponent>;
  let answerService: jasmine.SpyObj<AnswerService>;
  let globalEvaluationService: jasmine.SpyObj<GlobalEvaluationService>;

  beforeEach(async () => {
    answerService = jasmine.createSpyObj('AnswerService', [
      'getByReferenceAndPia',
      'findAllByPia',
      'create',
      'update',
    ]);
    answerService.getByReferenceAndPia.and.returnValue(Promise.resolve(null));
    answerService.findAllByPia.and.returnValue(Promise.resolve([]));
    answerService.create.and.callFake(async (answer: Answer) => {
      answer.id = 1;
      return answer;
    });
    answerService.update.and.callFake(async (answer: Answer) => answer);

    globalEvaluationService = jasmine.createSpyObj('GlobalEvaluationService', [
      'validate',
    ]);
    globalEvaluationService.validate.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [PiaModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: AnswerService, useValue: answerService },
        { provide: GlobalEvaluationService, useValue: globalEvaluationService },
        {
          provide: MeasureService,
          useValue: {
            findAllByPia: jasmine
              .createSpy('findAllByPia')
              .and.returnValue(Promise.resolve([])),
          },
        },
        {
          provide: CommentsService,
          useValue: {
            findAllByReference: jasmine
              .createSpy('findAllByReference')
              .and.returnValue(Promise.resolve([])),
          },
        },
        { provide: KnowledgeBaseService, useValue: {} },
        { provide: DialogService, useValue: {} },
        { provide: LanguagesService, useValue: { selectedLanguage: 'en' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionsComponent);
    component = fixture.componentInstance;
    component.pia = { id: 1, status: 0 };
    component.section = { id: 3 };
    component.item = { id: 3, evaluation_mode: 'item' };
    component.question = {
      id: 335,
      title: 'Risk severity',
      placeholder: 'Explain the severity',
      answer_type: 'gauge',
    };
  });

  async function renderQuestion(): Promise<HTMLInputElement> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.pia-gaugeBlock input');
  }

  it('saves the selected gauge value and validates the evaluation', async () => {
    const gauge = await renderQuestion();
    expect(gauge).not.toBeNull();

    gauge.value = '3';
    gauge.dispatchEvent(new Event('input'));
    gauge.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(component.questionForm.controls['gauge'].value).toBe(3);
    expect(answerService.create).toHaveBeenCalled();
    const savedAnswer = answerService.create.calls.mostRecent().args[0];
    expect(savedAnswer.reference_to).toBe(335);
    expect(savedAnswer.data.gauge).toBe(3);
    expect(globalEvaluationService.validate).toHaveBeenCalled();
  });

  it('does not save a gauge change in read-only mode', async () => {
    component.editMode = ['evaluator'];
    const gauge = await renderQuestion();

    expect(component.isGaugeDisabled()).toBeTrue();
    gauge.value = '3';
    gauge.dispatchEvent(new Event('change'));

    expect(gauge.value).toBe('0');
    expect(answerService.create).not.toHaveBeenCalled();
  });
});
