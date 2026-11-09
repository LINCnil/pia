import { TestBed } from '@angular/core/testing';
import { Answer } from '../models/answer.model';
import { Evaluation } from '../models/evaluation.model';
import { Pia } from '../models/pia.model';
import { AnswerService } from './answer.service';
import { ApiService } from './api.service';
import { EvaluationService } from './evaluation.service';
import { GlobalEvaluationService } from './global-evaluation.service';
import { MeasureService } from './measures.service';

describe('GlobalEvaluationService', () => {
  let service: GlobalEvaluationService;
  let answers: Record<number, Answer>;
  let answerLookup: jasmine.Spy;
  let evaluationLookup: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GlobalEvaluationService,
        { provide: ApiService, useValue: {} },
      ],
    });

    answers = {
      331: Object.assign(new Answer(), {
        reference_to: 331,
        data: { list: ['Impact'], text: null, gauge: null },
      }),
      335: Object.assign(new Answer(), {
        reference_to: 335,
        data: { list: [], text: 'Justification', gauge: 3 },
      }),
    };

    evaluationLookup = spyOn(
      EvaluationService.prototype,
      'getByReference'
    ).and.returnValue(Promise.resolve(null));
    answerLookup = spyOn(
      AnswerService.prototype,
      'getByReferenceAndPia'
    ).and.callFake(async (_piaId, reference) => answers[reference] || null);

    service = TestBed.inject(GlobalEvaluationService);
    service.pia = Object.assign(new Pia(), { id: 1 });
    service.section = { id: 3 };
    service.item = {
      id: 3,
      evaluation_mode: 'item',
      questions: [
        { id: 331, answer_type: 'list' },
        { id: 335, answer_type: 'gauge' },
      ],
    };
  });

  it('marks a completed item ready for evaluation', async () => {
    const result = await service.validate();

    expect(result.reference_to).toBe('3.3');
    expect(result.status).toBe(2);
    expect(service.answerEditionEnabled).toBeTrue();
  });

  it('keeps simultaneous validations independent', async () => {
    const results = await Promise.all([service.validate(), service.validate()]);

    expect(results.map((result) => result.status)).toEqual([2, 2]);
    expect(service.status).toBe(2);
  });

  it('does not publish an outdated validation after navigation', async () => {
    let finishLookup: (value: null) => void;
    const pendingLookup = new Promise<null>((resolve) => {
      finishLookup = resolve;
    });
    evaluationLookup.and.callFake((_piaId, reference) =>
      reference === '3.3' ? pendingLookup : Promise.resolve(null)
    );
    const notifications = spyOn(
      service.behaviorSubject,
      'next'
    ).and.callThrough();

    const previousValidation = service.validate();
    await Promise.resolve();
    expect(evaluationLookup).toHaveBeenCalledWith(1, '3.3');

    answers[111] = Object.assign(new Answer(), {
      reference_to: 111,
      data: { text: 'Current answer', gauge: null, list: [] },
    });
    service.section = { id: 1 };
    service.item = {
      id: 1,
      evaluation_mode: 'item',
      questions: [{ id: 111, answer_type: 'text' }],
    };
    const currentValidation = service.validate();
    finishLookup(null);

    expect(await previousValidation).toEqual({
      reference_to: '3.3',
      status: null,
    });
    expect(await currentValidation).toEqual({ reference_to: '1.1', status: 2 });
    expect(notifications).toHaveBeenCalledTimes(1);
    expect(notifications).toHaveBeenCalledWith({
      reference_to: '1.1',
      status: 2,
    });
  });

  it('keeps queued validations tied to their original route', async () => {
    const previousValidation = service.validate();
    answers[111] = Object.assign(new Answer(), {
      reference_to: 111,
      data: { text: 'Current answer', gauge: null, list: [] },
    });
    service.section = { id: 1 };
    service.item = {
      id: 1,
      evaluation_mode: 'item',
      questions: [{ id: 111, answer_type: 'text' }],
    };
    const currentValidation = service.validate();

    expect(await previousValidation).toEqual({
      reference_to: '3.3',
      status: null,
    });
    expect(await currentValidation).toEqual({ reference_to: '1.1', status: 2 });
    expect(evaluationLookup).toHaveBeenCalledTimes(1);
    expect(evaluationLookup).toHaveBeenCalledWith(1, '1.1');
  });

  it('keeps evaluation preparation and validation from interleaving', async () => {
    service.item.evaluation_mode = 'question';
    await service.validate();
    answerLookup.calls.reset();
    evaluationLookup.calls.reset();

    let finishAnswer: (value: Answer) => void;
    const pendingAnswer = new Promise<Answer>((resolve) => {
      finishAnswer = resolve;
    });
    answerLookup.and.callFake((_piaId, reference) =>
      reference === 331 ? pendingAnswer : Promise.resolve(answers[reference])
    );
    const create = spyOn(EvaluationService.prototype, 'create').and.returnValue(
      Promise.resolve(null)
    );

    const preparation = service.prepareForEvaluation();
    const validation = service.validate();
    await Promise.resolve();
    await Promise.resolve();
    expect(answerLookup.calls.count()).toBe(2);

    finishAnswer(answers[331]);
    await preparation;
    await validation;

    expect(create.calls.allArgs().map((args) => args[0].reference_to)).toEqual([
      '3.3.331',
      '3.3.335',
    ]);
  });

  it('prepares the requested assessment even if navigation changes', async () => {
    service.item.evaluation_mode = 'question';
    await service.validate();
    answerLookup.calls.reset();

    let finishAnswer: (value: Answer) => void;
    const pendingAnswer = new Promise<Answer>((resolve) => {
      finishAnswer = resolve;
    });
    answerLookup.and.callFake((piaId, reference) =>
      piaId === 1 && reference === 331
        ? pendingAnswer
        : Promise.resolve(answers[reference] || null)
    );
    const create = spyOn(EvaluationService.prototype, 'create').and.returnValue(
      Promise.resolve(null)
    );
    const notifications = spyOn(
      service.behaviorSubject,
      'next'
    ).and.callThrough();
    const preparation = service.prepareForEvaluation();
    await Promise.resolve();
    await Promise.resolve();
    expect(answerLookup).toHaveBeenCalledWith(1, 331);

    answers[111] = Object.assign(new Answer(), {
      reference_to: 111,
      data: { text: 'Current answer', gauge: null, list: [] },
    });
    service.pia = Object.assign(new Pia(), { id: 2 });
    service.section = { id: 1 };
    service.item = {
      id: 1,
      evaluation_mode: 'item',
      questions: [{ id: 111, answer_type: 'text' }],
    };
    const currentValidation = service.validate();
    finishAnswer(answers[331]);

    await preparation;
    expect(await currentValidation).toEqual({ reference_to: '1.1', status: 2 });
    expect(
      create.calls
        .allArgs()
        .map((args) => [args[0].pia_id, args[0].reference_to])
    ).toEqual([
      [1, '3.3.331'],
      [1, '3.3.335'],
    ]);
    expect(notifications).toHaveBeenCalledTimes(1);
    expect(notifications).toHaveBeenCalledWith({
      reference_to: '1.1',
      status: 2,
    });
  });

  it('propagates preparation failures and releases later validations', async () => {
    const failure = new Error('Evaluation creation failed');
    spyOn(EvaluationService.prototype, 'create').and.returnValue(
      Promise.reject(failure)
    );

    const preparation = service.prepareForEvaluation();
    const validation = service.validate();

    await expectAsync(preparation).toBeRejectedWith(failure);
    expect((await validation).status).toBe(2);
  });

  it('finishes preparation when an item has no questions', async () => {
    service.item.evaluation_mode = 'question';
    service.item.questions = [];
    const create = spyOn(EvaluationService.prototype, 'create');

    await service.prepareForEvaluation();

    expect(create).not.toHaveBeenCalled();
    expect(service.status).toBe(0);
  });

  it('finishes validation when there are no questions', async () => {
    service.item.questions = [];

    expect((await service.validate()).status).toBe(0);
  });

  it('handles a missing answer in question-based evaluations', async () => {
    service.item.evaluation_mode = 'question';
    delete answers[335];

    expect((await service.validate()).status).toBe(1);
  });

  it('uses the requested assessment for question-based answer lookups', async () => {
    service.pia.id = 42;
    service.item.evaluation_mode = 'question';
    const requestPaths: string[] = [];
    answerLookup.and.callFake(function (
      this: AnswerService,
      _piaId: number,
      reference: number
    ) {
      requestPaths.push(this.getServerUrl());
      return Promise.resolve(answers[reference] || null);
    });

    expect((await service.validate()).status).toBe(2);
    expect(requestPaths).toEqual([
      '/pias/42/answers',
      '/pias/42/answers',
      '/pias/42/answers',
      '/pias/42/answers',
    ]);
  });

  [
    {
      name: 'validation',
      run: () => service.validateAllEvaluation(),
      write: 'update',
    },
    {
      name: 'evaluation cancellation',
      run: () => service.cancelForEvaluation(),
      write: 'delete',
    },
    {
      name: 'validation cancellation',
      run: () => service.cancelValidation(1),
      write: 'update',
    },
  ].forEach((operation) => {
    it(`waits for preparation before ${operation.name}`, async () => {
      await service.validate();

      let finishLookup: (value: null) => void;
      const pendingLookup = new Promise<null>((resolve) => {
        finishLookup = resolve;
      });
      const evaluation = { id: 1, status: 3, global_status: 0 };
      let calls = 0;
      evaluationLookup.and.callFake(() =>
        calls++ === 0 ? pendingLookup : Promise.resolve(evaluation)
      );
      const writes: string[] = [];
      spyOn(EvaluationService.prototype, 'create').and.callFake(
        async (value) => {
          writes.push('create');
          return value;
        }
      );
      spyOn(EvaluationService.prototype, 'update').and.callFake(async () => {
        writes.push('update');
      });
      spyOn(EvaluationService.prototype, 'delete').and.callFake(async () => {
        writes.push('delete');
      });

      const preparation = service.prepareForEvaluation();
      await Promise.resolve();
      const nextOperation = operation.run();
      finishLookup(null);
      await Promise.all([preparation, nextOperation]);

      expect(writes).toEqual(['create', operation.write]);
    });
  });

  it('waits for all question evaluations to be saved before completing validation', async () => {
    service.item.evaluation_mode = 'question';
    const evaluations = {
      '3.3.331': Object.assign(new Evaluation(), {
        id: 1,
        reference_to: '3.3.331',
        status: 1,
        evaluation_comment: 'Needs correction',
      }),
      '3.3.335': Object.assign(new Evaluation(), {
        id: 2,
        reference_to: '3.3.335',
        status: 3,
      }),
    };
    evaluationLookup.and.callFake(
      async (_piaId, reference) => evaluations[reference]
    );

    let finishUpdate: () => void;
    let signalUpdate: () => void;
    const pendingUpdate = new Promise<void>((resolve) => {
      finishUpdate = resolve;
    });
    const updateStarted = new Promise<void>((resolve) => {
      signalUpdate = resolve;
    });
    const update = spyOn(EvaluationService.prototype, 'update').and.callFake(
      async (evaluation) => {
        if (evaluation.id === 1) {
          signalUpdate();
          await pendingUpdate;
        }
      }
    );

    let completed = false;
    const validation = service.validateAllEvaluation().then((result) => {
      completed = true;
      return result;
    });
    await updateStarted;
    await Promise.resolve();
    expect(completed).toBeFalse();
    expect(update).toHaveBeenCalledTimes(1);

    finishUpdate();
    expect(await validation).toBeTrue();
    expect(update).toHaveBeenCalledTimes(2);
    expect(evaluations['3.3.331'].global_status).toBe(1);
    expect(evaluations['3.3.335'].global_status).toBe(2);
    expect(service.status).toBe(3);
  });

  it('does not validate an evaluation that has not started', async () => {
    evaluationLookup.and.returnValue(
      Promise.resolve(Object.assign(new Evaluation(), { id: 1 }))
    );
    const update = spyOn(EvaluationService.prototype, 'update');

    expect(await service.validateAllEvaluation()).toBeFalse();
    expect(update).not.toHaveBeenCalled();
    expect(service.status).toBe(4);
  });

  it('cancels question evaluations in their original assessment after navigation', async () => {
    service.item.evaluation_mode = 'question';
    const evaluations = {
      '3.3.331': Object.assign(new Evaluation(), {
        id: 1,
        reference_to: '3.3.331',
      }),
      '3.3.335': Object.assign(new Evaluation(), {
        id: 2,
        reference_to: '3.3.335',
      }),
    };
    evaluationLookup.and.callFake(
      async (_piaId, reference) => evaluations[reference]
    );

    let finishDelete: () => void;
    let signalDelete: () => void;
    const pendingDelete = new Promise<void>((resolve) => {
      finishDelete = resolve;
    });
    const deleteStarted = new Promise<void>((resolve) => {
      signalDelete = resolve;
    });
    const deleted: Array<[number, number]> = [];
    spyOn(EvaluationService.prototype, 'delete').and.callFake(async function (
      this: EvaluationService,
      id: number
    ) {
      deleted.push([this.pia_id, id]);
      if (id === 1) {
        signalDelete();
        await pendingDelete;
      }
    });
    const notifications = spyOn(
      service.behaviorSubject,
      'next'
    ).and.callThrough();

    const cancellation = service.cancelForEvaluation();
    await deleteStarted;
    answers[111] = Object.assign(new Answer(), {
      reference_to: 111,
      data: { text: 'Current answer', gauge: null, list: [] },
    });
    service.pia = Object.assign(new Pia(), { id: 2 });
    service.section = { id: 1 };
    service.item = {
      id: 1,
      evaluation_mode: 'item',
      questions: [{ id: 111, answer_type: 'text' }],
    };
    const currentValidation = service.validate();
    finishDelete();

    expect(await cancellation).toBeTrue();
    expect(await currentValidation).toEqual({ reference_to: '1.1', status: 2 });
    expect(deleted).toEqual([
      [1, 1],
      [1, 2],
    ]);
    expect(notifications).toHaveBeenCalledTimes(1);
    expect(notifications).toHaveBeenCalledWith({
      reference_to: '1.1',
      status: 2,
    });
  });

  it('returns all question evaluations to evaluation mode', async () => {
    service.item.evaluation_mode = 'question';
    const evaluations = {
      '3.3.331': Object.assign(new Evaluation(), {
        id: 1,
        reference_to: '3.3.331',
        status: 3,
        global_status: 2,
      }),
      '3.3.335': Object.assign(new Evaluation(), {
        id: 2,
        reference_to: '3.3.335',
        status: 3,
        global_status: 2,
      }),
    };
    evaluationLookup.and.callFake(
      async (_piaId, reference) => evaluations[reference]
    );
    const update = spyOn(EvaluationService.prototype, 'update').and.returnValue(
      Promise.resolve()
    );

    expect(await service.cancelValidation(1)).toBeTrue();
    expect(update.calls.allArgs().map((args) => args[0].reference_to)).toEqual([
      '3.3.331',
      '3.3.335',
    ]);
    expect(evaluations['3.3.331'].global_status).toBe(1);
    expect(evaluations['3.3.335'].global_status).toBe(1);
    expect(service.status).toBe(6);
  });

  it('finishes question-based operations when there are no answers', async () => {
    service.item.evaluation_mode = 'question';
    service.item.questions = [];

    expect(await service.validateAllEvaluation()).toBeFalse();
    expect(await service.cancelForEvaluation()).toBeTrue();
    expect(await service.cancelValidation(1)).toBeTrue();
    expect(evaluationLookup).not.toHaveBeenCalled();
    expect(service.status).toBe(0);
  });

  it('rejects validation when its evaluation is missing', async () => {
    await expectAsync(service.validateAllEvaluation()).toBeRejectedWithError(
      'Evaluation not found: 3.3'
    );
    expect((await service.validate()).status).toBe(2);
  });

  it('rejects cancellation for a different assessment', async () => {
    await expectAsync(service.cancelValidation(2)).toBeRejectedWithError(
      'Cannot cancel validation for a different PIA'
    );
    expect(evaluationLookup).not.toHaveBeenCalled();
  });

  [
    {
      name: 'validation',
      run: () => service.validateAllEvaluation(),
      write: 'update',
    },
    {
      name: 'evaluation cancellation',
      run: () => service.cancelForEvaluation(),
      write: 'delete',
    },
    {
      name: 'validation cancellation',
      run: () => service.cancelValidation(1),
      write: 'update',
    },
  ].forEach((operation) => {
    it(`propagates ${operation.name} failures and releases later validations`, async () => {
      const evaluation = Object.assign(new Evaluation(), { id: 1, status: 3 });
      evaluationLookup.and.returnValue(Promise.resolve(evaluation));
      const failure = new Error('Evaluation write failed');
      spyOn(EvaluationService.prototype, 'update').and.callFake(async () => {
        if (operation.write === 'update') {
          throw failure;
        }
      });
      spyOn(EvaluationService.prototype, 'delete').and.callFake(async () => {
        if (operation.write === 'delete') {
          throw failure;
        }
      });

      const failed = operation.run();
      const next = service.validate();

      await expectAsync(failed).toBeRejectedWith(failure);
      expect((await next).reference_to).toBe('3.3');
    });
  });

  it('requires both a title and content for each measure', async () => {
    service.item = { id: 1, evaluation_mode: 'question', is_measure: true };
    spyOn(MeasureService.prototype, 'findAllByPia').and.returnValue(
      Promise.resolve([
        { id: 1, title: 'Control', content: 'Description' },
        { id: 2, title: 'Incomplete control', content: '' },
      ])
    );

    expect((await service.validate()).status).toBe(1);
  });

  it('propagates a failed lookup and releases later validations', async () => {
    const failure = new Error('Evaluation lookup failed');
    let calls = 0;
    evaluationLookup.and.callFake(async () => {
      if (calls++ === 0) {
        throw failure;
      }
      return null;
    });

    const failed = service.validate();
    const next = service.validate();

    await expectAsync(failed).toBeRejectedWith(failure);
    expect((await next).status).toBe(2);
  });
});
