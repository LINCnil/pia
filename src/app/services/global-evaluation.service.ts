import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Answer } from '../models/answer.model';
import { Evaluation } from '../models/evaluation.model';
import { Measure } from '../models/measure.model';
import { Pia } from '../models/pia.model';
import { AnswerService } from './answer.service';
import { ApiService } from './api.service';
import { EvaluationService } from './evaluation.service';
import { MeasureService } from './measures.service';

interface ValidationContext {
  pia: Pia;
  section: any;
  item: any;
  referenceTo: string;
}

interface VerifiedAnswers {
  questionsOrMeasures: any[];
  answersOrMeasures: Array<Answer | Measure>;
}

@Injectable()
export class GlobalEvaluationService {
  private router: Router;
  public pia: Pia;
  public section: any;
  public item: any;
  public status: number = null;
  public answerEditionEnabled = false;
  public evaluationEditionEnabled = false;
  public reference_to: string;
  public enablePiaValidation: boolean;
  public piaIsRefused: boolean;
  private questionsOrMeasures: Array<any>;
  private answersOrMeasures: Array<Answer | Measure>;
  private evaluations: Array<Evaluation>;
  public behaviorSubject = new BehaviorSubject<object>({});
  private answerService: AnswerService;
  private evaluationService: EvaluationService;
  private measureService: MeasureService;
  private operationQueue: Promise<void> = Promise.resolve();

  constructor(private apiService: ApiService) {
    this.answerService = new AnswerService(this.router, this.apiService);
    this.evaluationService = new EvaluationService(
      this.router,
      this.apiService
    );
    this.measureService = new MeasureService(this.router, this.apiService);
  }

  /**
   * Verifications for answers and evaluations.
   * @param {boolean} [callSubject=true]
   * @returns {Promise}
   */
  async validate(callSubject = true): Promise<any> {
    const context = this.getValidationContext();
    return this.withEvaluationLock(() =>
      this.runValidation(context, callSubject)
    );
  }

  private getValidationContext(): ValidationContext {
    return {
      pia: this.pia,
      section: this.section,
      item: this.item,
      referenceTo: this.section.id + '.' + this.item.id,
    };
  }

  private isCurrentContext(context: ValidationContext): boolean {
    return (
      this.pia === context.pia &&
      this.section === context.section &&
      this.item === context.item
    );
  }

  private async withEvaluationLock<T>(operation: () => Promise<T>): Promise<T> {
    // Evaluation operations share database services and their PIA context.
    const previousOperation = this.operationQueue;
    let releaseOperation: () => void;
    this.operationQueue = new Promise<void>((resolve) => {
      releaseOperation = resolve;
    });

    await previousOperation;
    try {
      return await operation();
    } finally {
      releaseOperation();
    }
  }

  private async runValidation(
    context: ValidationContext,
    callSubject: boolean
  ): Promise<{ reference_to: string; status: number }> {
    const outdatedResult = { reference_to: context.referenceTo, status: null };
    if (!this.isCurrentContext(context)) {
      return outdatedResult;
    }

    this.reference_to = context.referenceTo;
    if (
      context.item.evaluation_mode === 'item' ||
      context.item.evaluation_mode === 'question'
    ) {
      if (context.pia) {
        const evaluations = await this.evaluationsVerification(context);
        if (!this.isCurrentContext(context)) {
          return outdatedResult;
        }
        const answers = await this.answersVerification(context);
        if (!this.isCurrentContext(context)) {
          return outdatedResult;
        }
        this.evaluations = evaluations;
        this.questionsOrMeasures = answers.questionsOrMeasures;
        this.answersOrMeasures = answers.answersOrMeasures;
      }
      this.verification();
      if (callSubject) {
        this.setAnswerEditionEnabled();
        this.setEvaluationEditionEnabled();
        this.behaviorSubject.next({
          reference_to: this.reference_to,
          status: this.status,
        });
      }
    } else if (this.reference_to === '4.3') {
      this.dpoValidation();
      this.behaviorSubject.next({
        reference_to: this.reference_to,
        status: this.status,
      });
    } else {
      this.status = 0;
    }
    return { reference_to: this.reference_to, status: this.status };
  }

  /**
   * Prepare all evaluations for the current item, it depends on "evaluation_mode".
   * @returns {Promise}
   */
  async prepareForEvaluation(): Promise<void> {
    const context = this.getValidationContext();
    await this.withEvaluationLock(async () => {
      const references = await this.getEvaluationReferences(context);
      for (const reference of references) {
        await this.createOrUpdateEvaluation(context, reference);
      }
      await this.runValidation(context, true);
    });
  }

  /**
   * Validate all evaluations.
   * @returns {Promise}
   */
  async validateAllEvaluation(): Promise<boolean> {
    const context = this.getValidationContext();
    return this.withEvaluationLock(async () => {
      const references = await this.getEvaluationReferences(context);
      let toFix = false;
      for (const reference of references) {
        const evaluation = await this.getEvaluation(context, reference);
        if (evaluation.status > 0) {
          evaluation.global_status = evaluation.status === 1 ? 1 : 2;
          toFix = toFix || evaluation.status === 1;
          evaluation.evaluation_infos = JSON.stringify(context.item);
          await this.evaluationService.update(evaluation);
        }
      }
      await this.runValidation(context, true);
      return toFix;
    });
  }

  /**
   * Cancel evaluation and return in edit mode.
   */
  async cancelForEvaluation(): Promise<boolean> {
    const context = this.getValidationContext();
    return this.withEvaluationLock(async () => {
      const references = await this.getEvaluationReferences(context);
      for (const reference of references) {
        await this.deleteEvaluationInDb(context, reference);
      }
      await this.runValidation(context, true);
      return true;
    });
  }

  /**
   * Cancel validation and return in evaluation mode.
   */
  async cancelValidation(piaId: number): Promise<Evaluation | boolean> {
    const context = this.getValidationContext();
    if (context.pia.id !== piaId) {
      throw new Error('Cannot cancel validation for a different PIA');
    }

    return this.withEvaluationLock(async () => {
      const references = await this.getEvaluationReferences(context);
      let lastEvaluation: Evaluation;
      for (const reference of references) {
        lastEvaluation = await this.getEvaluation(context, reference);
        lastEvaluation.global_status = 1;
        await this.evaluationService.update(lastEvaluation);
      }
      await this.runValidation(context, true);
      return context.item.evaluation_mode === 'item' ? lastEvaluation : true;
    });
  }

  /**
   * Verification for DPD fields.
   * @private
   */
  private dpoValidation(): void {
    let dpoFilled = false;
    let concernedPeopleOpinionSearchedFieldsFilled = false;
    let concernedPeopleOpinionUnsearchedFieldsFilled = false;
    // All DPO fields filled = OK
    if (
      this.pia.dpos_names &&
      this.pia.dpos_names.length > 0 &&
      (this.pia.dpo_status === 0 || this.pia.dpo_status === 1) &&
      this.pia.dpo_opinion &&
      this.pia.dpo_opinion.length > 0
    ) {
      dpoFilled = true;
    }

    // Concerned people opinion unsearched + no search reason field filled = OK
    if (this.pia.concerned_people_searched_opinion === false) {
      if (
        this.pia.concerned_people_searched_content &&
        this.pia.concerned_people_searched_content.length > 0
      ) {
        concernedPeopleOpinionUnsearchedFieldsFilled = true;
      }
    }

    // Concerned people opinion searched + name(s) + status + opinions = OK :
    if (this.pia.concerned_people_searched_opinion === true) {
      if (
        this.pia.people_names &&
        this.pia.people_names.length > 0 &&
        (this.pia.concerned_people_status === 0 ||
          this.pia.concerned_people_status === 1) &&
        this.pia.concerned_people_opinion &&
        this.pia.concerned_people_opinion.length > 0
      ) {
        concernedPeopleOpinionSearchedFieldsFilled = true;
      }
    }

    // Treatment which validates the subsection if everything is OK
    // DPO filled + unsearched opinion scenario filled OR DPO filled + searched opinion scenario filled
    if (
      (dpoFilled === true &&
        concernedPeopleOpinionUnsearchedFieldsFilled === true) ||
      (dpoFilled === true &&
        concernedPeopleOpinionSearchedFieldsFilled === true)
    ) {
      this.status = 7;
      this.enablePiaValidation = [0, 2, 3].includes(this.pia.status);
      this.piaIsRefused = [1, 4].includes(this.pia.status);
      if (this.pia.status > 1) {
        this.status = 8;
      }
    } else {
      this.enablePiaValidation = false;
      this.piaIsRefused = false;
      this.status = 0;
    }
  }

  /**
   * Get the reference.
   * @private
   * @param {any} answerOrMeasure - Any Answer or Measure.
   * @returns {string} - The reference.
   */
  private getAnswerReferenceTo(
    answerOrMeasure,
    item,
    reference: string
  ): string {
    let reference_to = reference;
    if (item.is_measure) {
      // For measure
      reference_to += '.' + answerOrMeasure.id;
    } else {
      // For question
      reference_to += '.' + answerOrMeasure.reference_to;
    }
    return reference_to;
  }

  private async getEvaluationReferences(
    context: ValidationContext
  ): Promise<string[]> {
    if (context.item.evaluation_mode === 'item') {
      return [context.referenceTo];
    }

    const answers = await this.answersVerification(context);
    return answers.answersOrMeasures.map((answerOrMeasure) =>
      this.getAnswerReferenceTo(
        answerOrMeasure,
        context.item,
        context.referenceTo
      )
    );
  }

  private async getEvaluation(
    context: ValidationContext,
    reference: string
  ): Promise<Evaluation> {
    this.evaluationService.pia_id = context.pia.id;
    const evaluation: Evaluation = await this.evaluationService.getByReference(
      context.pia.id,
      reference
    );
    if (!evaluation) {
      throw new Error(`Evaluation not found: ${reference}`);
    }
    return evaluation;
  }

  /**
   * Create a new evaluation or update it.
   * @private
   * @param {ValidationContext} context - The assessment and item to update.
   * @param {string} reference_to - The reference.
   * @returns {Promise}
   */
  private async createOrUpdateEvaluation(
    context: ValidationContext,
    reference_to: string
  ): Promise<any> {
    this.evaluationService.pia_id = context.pia.id;
    const evaluation: Evaluation = await this.evaluationService.getByReference(
      context.pia.id,
      reference_to
    );
    if (!evaluation) {
      const newEvaluation = new Evaluation();
      newEvaluation.pia_id = context.pia.id;
      newEvaluation.reference_to = reference_to;
      newEvaluation.evaluation_infos = JSON.stringify(context.item);
      return this.evaluationService.create(newEvaluation);
    }
    if (evaluation.status === 1) {
      evaluation.global_status = 0;
      await this.evaluationService.update(evaluation);
    }
    return evaluation;
  }

  /**
   * Do a global verification.
   * @private
   */
  private verification(): void {
    if (!this.answersOrMeasures) {
      return;
    }
    const answersOrMeasuresValid: Array<Answer | Measure> =
      this.answersOrMeasures.filter((answerOrMeasure: any) => {
        if (answerOrMeasure.data !== undefined) {
          return this.answerIsValid(answerOrMeasure);
        } else {
          return this.measureIsValid(answerOrMeasure);
        }
      });
    if (
      this.answersOrMeasures.length > 0 &&
      answersOrMeasuresValid.length === this.questionsOrMeasures.length
    ) {
      if (this.evaluations.length === 0) {
        this.status = 2;
      } else {
        const evaluationsStarted: Array<Evaluation> = this.evaluations.filter(
          (evaluation: Evaluation) => {
            return this.evaluationStarted(evaluation);
          }
        );
        if (evaluationsStarted.length === this.evaluations.length) {
          const evaluationsCompleted: Array<Evaluation> =
            this.evaluations.filter((evaluation: Evaluation) => {
              return this.evaluationCompleted(evaluation);
            });
          if (evaluationsCompleted.length === this.evaluations.length) {
            if (this.pia.status >= 2) {
              this.status = 8;
            } else {
              this.status = 7;
            }
          } else {
            // If we have one or more evaluation status "toBeFixed"
            const evaluationToBeFixed: Array<Evaluation> =
              this.evaluations.filter((evaluation: Evaluation) => {
                return this.evaluationsToBeFixed(evaluation);
              });
            if (evaluationToBeFixed.length > 0) {
              this.status = 3;
            } else {
              const evaluationsIsValid: Array<Evaluation> =
                this.evaluations.filter((evaluation: Evaluation) => {
                  return this.evaluationIsValid(evaluation);
                });
              if (
                evaluationsIsValid.length > 0 &&
                evaluationsIsValid.length === this.evaluations.length
              ) {
                this.status = 6;
              } else {
                this.status = 5;
              }
            }
          }
        } else {
          const evaluationsNotStarted: Array<Evaluation> =
            this.evaluations.filter((evaluation: Evaluation) => {
              return this.evaluationNotStarted(evaluation);
            });
          if (evaluationsNotStarted.length === this.evaluations.length) {
            this.status = 4;
          } else {
            this.status = 5;
          }
        }
      }
    } else if (this.answersOrMeasures.length > 0) {
      this.status = 1;
    } else {
      this.status = 0;
    }
  }

  /**
   * The evaluation need to be fixed?
   * @private
   * @param {Evaluation} evaluation - An Evaluation.
   * @returns {boolean}
   */
  private evaluationsToBeFixed(evaluation: Evaluation): boolean {
    if (evaluation.status === 1 && evaluation.global_status === 1) {
      return true;
    }
    return false;
  }

  /**
   * The evaluation is started?
   * @private
   * @param {Evaluation} evaluation - An Evaluation.
   * @returns {boolean}
   */
  private evaluationStarted(evaluation: Evaluation): boolean {
    if (evaluation.status > 0) {
      return true;
    }
    return false;
  }

  /**
   * The evaluation is completed?
   * @private
   * @param {Evaluation} evaluation - An Evaluation.
   * @returns {boolean}
   */
  private evaluationCompleted(evaluation: Evaluation): boolean {
    if (evaluation.status > 1 && evaluation.global_status === 2) {
      return true;
    }
    return false;
  }

  /**
   * The evaluation isn't started?
   * @private
   * @param {Evaluation} evaluation - An Evaluation.
   */
  private evaluationNotStarted(evaluation: Evaluation): boolean {
    if (evaluation.status === 0) {
      return true;
    }
    return false;
  }

  /**
   * Is the measure valid?
   * @private
   * @param {Measure} measure - A Measure.
   */
  private measureIsValid(measure: Measure): boolean {
    if (
      (measure.content && measure.content.length > 0) ||
      (measure.title && measure.title.length > 0)
    ) {
      return true;
    }
    return false;
  }

  /**
   * Is the answer valid?
   * @private
   * @param {Answer} answer - An Answer.
   */
  private answerIsValid(answer: Answer): boolean {
    let valid = false;
    const gauge = answer.data.gauge;
    const text = answer.data.text;
    const list = answer.data.list;

    // First we need to find the answer_type
    const question = this.item.questions.filter((q) => {
      return parseInt(q.id, 10) === parseInt(answer.reference_to, 10);
    });

    if (question.length === 1) {
      const answer_type = question[0].answer_type;
      if (answer_type === 'gauge') {
        valid = text && text.length > 0 && gauge > 0;
      } else if (answer_type === 'list') {
        valid = list && list.length > 0;
      } else if (answer_type === 'text') {
        valid = text && text.length > 0;
      }
    }

    return valid;
  }

  /**
   * Is the evaluation valid?
   * @private
   * @param {Evaluation} evaluation - An Evaluation.
   * @returns {boolean}
   */
  private evaluationIsValid(evaluation: Evaluation): boolean {
    if (evaluation.status === 1) {
      return (
        evaluation.evaluation_comment &&
        evaluation.evaluation_comment.length > 0
      );
    } else if (evaluation.status === 2) {
      if (this.item.evaluation_mode === 'question') {
        return (
          evaluation.action_plan_comment &&
          evaluation.action_plan_comment.length > 0
        );
      }
      if (
        this.item.evaluation_mode === 'item' &&
        this.item.evaluation_with_gauge === true
      ) {
        if (
          evaluation.gauges &&
          evaluation.gauges['x'] > 0 &&
          evaluation.gauges['y'] > 0 &&
          evaluation.action_plan_comment &&
          evaluation.action_plan_comment.length > 0
        ) {
          return true;
        }
      }
    } else if (evaluation.status === 3) {
      return true;
    }
    return false;
  }

  /**
   * Verification for all answers.
   * @private
   * @returns {Promise}
   */
  private async answersVerification(
    context: ValidationContext
  ): Promise<VerifiedAnswers> {
    this.answerService.pia_id = context.pia.id;
    this.measureService.pia_id = context.pia.id;

    if (context.item.is_measure) {
      const measures: Measure[] = await this.measureService.findAllByPia(
        context.pia.id
      );
      const questionsOrMeasures = measures || [];
      return {
        questionsOrMeasures,
        answersOrMeasures: questionsOrMeasures.filter(
          (measure) =>
            measure.title &&
            measure.title.length > 0 &&
            measure.content &&
            measure.content.length > 0
        ),
      };
    }
    const questionsOrMeasures = context.item.questions || [];
    const answers: Answer[] = await Promise.all(
      questionsOrMeasures.map((question) =>
        this.answerService.getByReferenceAndPia(context.pia.id, question.id)
      )
    );
    return {
      questionsOrMeasures,
      answersOrMeasures: answers.filter((answer) => !!answer),
    };
  }

  /**
   * Verification for all evaluations.
   * @private
   * @returns {Promise}
   */
  private async evaluationsVerification(
    context: ValidationContext
  ): Promise<Evaluation[]> {
    this.answerService.pia_id = context.pia.id;
    this.evaluationService.pia_id = context.pia.id;
    this.measureService.pia_id = context.pia.id;

    if (context.item.evaluation_mode === 'item') {
      const evaluation: Evaluation =
        await this.evaluationService.getByReference(
          context.pia.id,
          context.referenceTo
        );
      return evaluation ? [evaluation] : [];
    }

    let references: Array<number | string>;
    if (context.item.is_measure) {
      const measures: Measure[] = await this.measureService.findAllByPia(
        context.pia.id
      );
      references = (measures || []).map((measure) => measure.id);
    } else {
      const answers: Answer[] = await Promise.all(
        (context.item.questions || []).map((question) =>
          this.answerService.getByReferenceAndPia(context.pia.id, question.id)
        )
      );
      references = answers
        .filter((answer) => !!answer)
        .map((answer) => answer.reference_to);
    }

    const evaluations: Evaluation[] = await Promise.all(
      references.map((reference) =>
        this.evaluationService.getByReference(
          context.pia.id,
          context.referenceTo + '.' + reference
        )
      )
    );
    return evaluations.filter((evaluation) => !!evaluation);
  }

  /**
   * Delete evaluation in database.
   * @private
   * @param {ValidationContext} context - The assessment and item to update.
   * @param {string} reference_to - The reference.
   * @returns {Promise}
   */
  private async deleteEvaluationInDb(
    context: ValidationContext,
    reference_to: string
  ): Promise<void> {
    this.evaluationService.pia_id = context.pia.id;
    const evaluation: Evaluation = await this.evaluationService.getByReference(
      context.pia.id,
      reference_to
    );
    if (evaluation) {
      await this.evaluationService.delete(evaluation.id);
    }
  }

  /**
   * Set answer edition by status.
   */
  setAnswerEditionEnabled(): void {
    if (this.pia) {
      this.answerEditionEnabled = [0, 1, 2, 3].includes(this.status);
    } else {
      // Structures
      this.answerEditionEnabled = true;
    }
  }

  /**
   * Set evaluation edition by status.
   */
  setEvaluationEditionEnabled(): void {
    this.evaluationEditionEnabled = [4, 5, 6].includes(this.status);
  }
}
