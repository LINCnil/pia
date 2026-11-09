import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PiaModule } from 'src/app/modules/pia/pia.module';
import { DialogService } from 'src/app/services/dialog.service';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import {
  ComponentTestData,
  createComponentTestData,
} from 'src/app/testing/component-test-data';
import {
  mockComponentServices,
  setComponentTestRoute,
} from 'src/app/testing/component-test-services';
import { ContentComponent } from './content.component';

describe('ContentComponent', () => {
  let component: ContentComponent;
  let fixture: ComponentFixture<ContentComponent>;
  let data: ComponentTestData;
  const operations = [
    {
      serviceMethod: 'prepareForEvaluation',
      componentMethod: 'prepareForEvaluation',
    },
    {
      serviceMethod: 'validateAllEvaluation',
      componentMethod: 'validateEvaluation',
    },
    {
      serviceMethod: 'cancelForEvaluation',
      componentMethod: 'cancelAskForEvaluation',
    },
    {
      serviceMethod: 'cancelValidation',
      componentMethod: 'cancelValidateEvaluation',
    },
  ] as const;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'AnswerService',
      'AppDataService',
      'CommentsService',
      'DialogService',
      'EvaluationService',
      'GlobalEvaluationService',
      'KnowledgeBaseService',
      'LanguagesService',
      'MeasureService',
      'PaginationService',
      'PiaService',
      'SidStatusService'
    );
    await TestBed.configureTestingModule({
      imports: [PiaModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(ContentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pia', data.pia);
    fixture.componentRef.setInput('section', data.section);
    fixture.componentRef.setInput('item', data.item);
    fixture.componentRef.setInput('questions', data.item.questions);
    fixture.componentRef.setInput('measures', []);
    fixture.componentRef.setInput('data', data.data);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  operations.forEach((operation) => {
    it(`shows an error when ${operation.serviceMethod} fails`, async () => {
      const evaluationService = TestBed.inject(GlobalEvaluationService);
      const dialogService = TestBed.inject(DialogService);
      const failure = new Error('Evaluation operation failed');
      evaluationService[operation.serviceMethod] = jasmine
        .createSpy()
        .and.callFake(async () => {
          throw failure;
        });
      spyOn(console, 'error');

      await component[operation.componentMethod]();

      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalledWith(
        'Evaluation operation failed',
        failure
      );
      expect(dialogService.confirmThis).toHaveBeenCalledTimes(1);
      const dialog = dialogService.confirmThis as jasmine.Spy;
      expect(dialog.calls.mostRecent().args[0].text).toBe(
        'modals.general_error.content'
      );
    });
  });

  operations.forEach((operation) => {
    it(`does not act on a different item after ${operation.serviceMethod}`, async () => {
      const evaluationService = TestBed.inject(GlobalEvaluationService);
      const dialogService = TestBed.inject(DialogService);
      const router = TestBed.inject(Router);
      let finishOperation: (value: boolean) => void;
      const pendingOperation = new Promise<boolean>((resolve) => {
        finishOperation = resolve;
      });
      evaluationService[operation.serviceMethod] = jasmine
        .createSpy()
        .and.returnValue(pendingOperation);
      spyOn(router, 'navigate');

      const action = component[operation.componentMethod]();
      component.item = { ...data.item, id: 2 };
      finishOperation(false);
      await action;

      expect(component.loading).toBeFalse();
      expect(router.navigate).not.toHaveBeenCalled();
      expect(dialogService.confirmThis).not.toHaveBeenCalled();
    });
  });

  it('keeps loading until overlapping evaluation operations finish', async () => {
    const evaluationService = TestBed.inject(GlobalEvaluationService);
    let finishPreparation: () => void;
    let finishCancellation: (value: boolean) => void;
    evaluationService.prepareForEvaluation = jasmine
      .createSpy()
      .and.returnValue(
        new Promise<void>((resolve) => {
          finishPreparation = resolve;
        })
      );
    evaluationService.cancelForEvaluation = jasmine.createSpy().and.returnValue(
      new Promise<boolean>((resolve) => {
        finishCancellation = resolve;
      })
    );

    const preparation = component.prepareForEvaluation();
    component.item = { ...data.item, id: 2 };
    const cancellation = component.cancelAskForEvaluation();
    finishPreparation();
    await preparation;
    expect(component.loading).toBeTrue();

    finishCancellation(true);
    await cancellation;
    expect(component.loading).toBeFalse();
  });

  it('only confirms cancellation after it succeeds', async () => {
    const evaluationService = TestBed.inject(GlobalEvaluationService);
    const dialogService = TestBed.inject(DialogService);
    evaluationService.cancelForEvaluation = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve(true));

    await component.cancelAskForEvaluation();

    expect(component.loading).toBeFalse();
    expect(dialogService.confirmThis).toHaveBeenCalledTimes(1);
    const dialog = dialogService.confirmThis as jasmine.Spy;
    expect(dialog.calls.mostRecent().args[0].text).toBe(
      'modals.back_to_edition.content'
    );
  });
});
