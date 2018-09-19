import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PiaService } from '../entry/pia.service';
import { Observable } from 'rxjs/Observable';

// new imports
import { Pia as PiaModel } from '@api/model/pia.model';
import { Evaluation as EvaluationModel } from '@api/model/evaluation.model';
import { Answer as AnswerModel } from '@api/model/answer.model';
import { Measure as MeasureModel } from '@api/model/measure.model';
import { PiaService as PiaApi } from '@api/service/pia.service';
import { EvaluationService as EvaluationApi } from '@api/service/evaluation.service';
import { AnswerService as AnswerApi } from '@api/service/answer.service';
import { MeasureService as MeasureApi } from '@api/service/measure.service';


@Injectable()
export class GlobalEvaluationService {
  public pia: PiaModel;
  public section: any;
  public item: any;
  public status = 0;
  public answerEditionEnabled = false;
  public evaluationEditionEnabled = false;
  public reference_to: string;
  public enablePiaValidation: boolean;
  public piaIsRefused: boolean;
  private questionsOrMeasures: Array<any>;
  private answersOrMeasures: Array<AnswerModel | MeasureModel>;
  private evaluations: Array<EvaluationModel>;

  public behaviorSubject = new BehaviorSubject<Object>({});


  constructor(
    private evaluationApi: EvaluationApi,
    private answerApi: AnswerApi,
    private measureApi: MeasureApi,
  ) { }

  /**
   * Verifications for answers and evaluations.
   * @param {boolean} [callSubject=true]
   * @returns {Promise}
   * @memberof GlobalEvaluationService
   */
  async validate(callSubject = true) {
    this.reference_to = this.section.id + '.' + this.item.id;
    return new Promise(async (resolve, reject) => {
      if (this.item.evaluation_mode === 'item' || this.item.evaluation_mode === 'question') {
        await this.answersVerification();
        await this.evaluationsVerification();
        this.verification();
        if (callSubject) {
          this.setAnswerEditionEnabled();
          this.setEvaluationEditionEnabled();
          this.behaviorSubject.next({
            reference_to: this.reference_to,
            status: this.status
          });
        }
      } else if (this.reference_to === '4.3') {
        this.dpoValidation();
        this.behaviorSubject.next({
          reference_to: this.reference_to,
          status: this.status
        });
      } else {
        this.status = 0;
      }
      resolve({ reference_to: this.reference_to, status: this.status });
    });
  }

  /**
   * Prepare all evaluations for the current item, it depends on "evaluation_mode".
   * @returns {Promise}
   * @memberof GlobalEvaluationService
   */
  async prepareForEvaluation() {
    return new Promise(async (resolve, reject) => {
      if (this.item.evaluation_mode === 'item') {
        await this.createOrUpdateEvaluation();
        await this.validate();
        resolve();
      } else {
        await this.answersVerification();
        let count = 0;
        this.answersOrMeasures.forEach(async (answerOrMeasure: AnswerModel | MeasureModel) => {
          count++;
          this.createOrUpdateEvaluation(this.getAnswerReferenceTo(answerOrMeasure));
          if (count === this.answersOrMeasures.length) {
            await this.validate();
            resolve();
          }
        });
      }
    });
  }

  /**
   * Validate all evaluations.
   * @returns {Promise}
   * @memberof GlobalEvaluationService
   */
  async validateAllEvaluation() {
    return new Promise((resolve, reject) => {
      if (this.item.evaluation_mode === 'item') {

        this.evaluationApi.getByRef(this.pia.id, this.reference_to)
          .subscribe(async (theEval: EvaluationModel) => {
            if (theEval.isPending()) {
              await this.validate();
              resolve(false);
            }
            if (theEval.isToBeFixed()) {
              theEval.beGloballyStarted();
            } else {
              theEval.beGloballyCompleted();
            }
            this.evaluationApi.update(theEval).subscribe(async (updatedEval: EvaluationModel) => {
              await this.validate();
              resolve(updatedEval.isToBeFixed());
            });
          });

      } else if (this.answersOrMeasures.length > 0) {
        let count = 0;
        let toFix = false;
        this.answersOrMeasures.forEach((answerOrMeasure) => {

          this.evaluationApi.getByRef(this.pia.id, this.getAnswerReferenceTo(answerOrMeasure))
            .subscribe(async (theEval: EvaluationModel) => {
              if (theEval.status > 0) {
                if (theEval.isToBeFixed()) {
                  theEval.beGloballyStarted();
                  toFix = true;
                } else {
                  theEval.beGloballyCompleted();
                }
                this.evaluationApi.update(theEval).subscribe(async (updatedEval: EvaluationModel) => {
                  count++;
                  if (count === this.answersOrMeasures.length) {
                    await this.validate();
                    resolve(toFix);
                  }
                });

              } else {
                await this.validate();
                resolve(false);
              }
            });
        });
      }
    });
  }

  /**
   * Cancel evaluation and return in edit mode.
   * @memberof GlobalEvaluationService
   */
  cancelForEvaluation() {
    if (this.item.evaluation_mode === 'item') {
      this.deleteEvaluationInDb(this.reference_to).then(() => {
        this.validate();
      });
    } else if (this.answersOrMeasures.length > 0) {
      let count = 0;
      this.answersOrMeasures.forEach((answerOrMeasure) => {
        this.deleteEvaluationInDb(this.getAnswerReferenceTo(answerOrMeasure)).then(() => {
          count++;
          if (count === this.answersOrMeasures.length) {
            this.validate();
          }
        });
      });
    }
  }

  /**
   * Cancel validation and return in evaluation mode.
   * @memberof GlobalEvaluationService
   */
  async cancelValidation() {
    if (this.item.evaluation_mode === 'item') {

      const theEval: EvaluationModel = await this.evaluationApi.getByRef(this.pia.id, this.reference_to).toPromise();

      theEval.global_status = 1;
      await this.evaluationApi.update(theEval).toPromise();
      this.validate();

    } else if (this.answersOrMeasures.length > 0) {

      this.answersOrMeasures.forEach(async (answerOrMeasure) => {
        const theEval: EvaluationModel = await this.evaluationApi.getByRef(
          this.pia.id,
          this.getAnswerReferenceTo(answerOrMeasure)
        ).toPromise();

        theEval.global_status = 1;
        await this.evaluationApi.update(theEval).toPromise();
        this.validate();
      });
    }
  }

  /**
   * Verification for DPD fields.
   * @private
   * @memberof GlobalEvaluationService
   */
  private dpoValidation() {
    let dpoFilled = false;
    let concernedPeopleOpinionSearchedFieldsFilled = false;
    let concernedPeopleOpinionUnsearchedFieldsFilled = false;
    // All DPO fields filled = OK
    if (this.pia.dpos_names && this.pia.dpos_names.length > 0 && (this.pia.dpo_status === 0 || this.pia.dpo_status === 1)
      && this.pia.dpo_opinion && this.pia.dpo_opinion.length > 0) {
      dpoFilled = true;
    }

    // Concerned people opinion unsearched + no search reason field filled = OK
    if (this.pia.concerned_people_searched_opinion === false) {
      if (this.pia.concerned_people_searched_content && this.pia.concerned_people_searched_content.length > 0) {
        concernedPeopleOpinionUnsearchedFieldsFilled = true;
      }
    }

    // Concerned people opinion searched + name(s) + status + opinions = OK :
    if (this.pia.concerned_people_searched_opinion === true) {
      if (this.pia.people_names && this.pia.people_names.length > 0
        && (this.pia.concerned_people_status === 0 || this.pia.concerned_people_status === 1)
        && this.pia.concerned_people_opinion && this.pia.concerned_people_opinion.length > 0) {
        concernedPeopleOpinionSearchedFieldsFilled = true;
      }
    }

    // Treatment which validates the subsection if everything is OK
    // DPO filled + unsearched opinion scenario filled OR DPO filled + searched opinion scenario filled
    if ((dpoFilled === true && concernedPeopleOpinionUnsearchedFieldsFilled === true)
      || (dpoFilled === true && concernedPeopleOpinionSearchedFieldsFilled === true)) {
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
   * @memberof GlobalEvaluationService
   */
  private getAnswerReferenceTo(answerOrMeasure) {
    let reference_to = this.reference_to;
    if (this.item.is_measure) {
      // For measure
      reference_to += '.' + answerOrMeasure.id;
    } else {
      // For question
      reference_to += '.' + answerOrMeasure.reference_to;
    }
    return reference_to;
  }

  /**
   * Create a new evaluation or udpate it.
   * @private
   * @param {string} [new_reference_to] - The reference.
   * @returns {Promise}
   * @memberof GlobalEvaluationService
   */
  private async createOrUpdateEvaluation(new_reference_to?: string) {
    return new Promise(async (resolve, reject) => {
      const reference_to = new_reference_to ? new_reference_to : this.reference_to;

      const theEval: EvaluationModel = await this.evaluationApi.getByRef(this.pia.id, reference_to).toPromise();

      if (!theEval) {
        const newEval = new EvaluationModel();
        newEval.pia_id = this.pia.id;
        newEval.reference_to = reference_to;
        await this.evaluationApi.create(newEval).toPromise();
      } else if (theEval.isToBeFixed()) {
        theEval.beGloballyNone();
        await this.evaluationApi.update(theEval).toPromise();
      }
      resolve();

    });

  }

  /**
   * Do a global verification.
   * @private
   * @memberof GlobalEvaluationService
   */
  private verification() {

    // NoAnswers
    if (!this.answersOrMeasures || this.answersOrMeasures.length === 0) {
      this.status = GlobalEvaluationStatus.AnswersNone; // 0
      return;
    }

    const answersOrMeasuresValid: Array<AnswerModel | MeasureModel> = this.answersOrMeasures.filter((answerOrMeasure: any) => {
      if (answerOrMeasure.data !== undefined) {
        return this.answerIsValid(answerOrMeasure);
      } else {
        return answerOrMeasure.hasValidTitleAndContent();
      }
    });

    // PendingAnswers
    if (answersOrMeasuresValid.length !== this.questionsOrMeasures.length) {
      this.status = GlobalEvaluationStatus.AnswersStarted; // 1
      return;
    }

    // WaitingForEvaluationAsk
    if (answersOrMeasuresValid.length === this.questionsOrMeasures.length && this.evaluations.length === 0) {
      this.status = GlobalEvaluationStatus.AnswersCompleted; // 2
      return;
    }

    const evaluationToBeFixed: Array<EvaluationModel> = this.evaluations.filter((evaluation: EvaluationModel) => {
      return evaluation.isToBeFixed() && evaluation.isGloballyStarted();
    });

    // SomeAnswersHaveToBeFixed

    if (evaluationToBeFixed.length > 0) {
      this.status = GlobalEvaluationStatus.AnswersToBeFixed; // 3
      return;
    }

    const evaluationsNotStarted: Array<EvaluationModel> = this.evaluations.filter((evaluation: EvaluationModel) => {
      return evaluation.isPending();
    });

    // WaitingForEvaluations
    if (evaluationsNotStarted.length === this.evaluations.length) {
      this.status = GlobalEvaluationStatus.EvaluationRequested; // 4
      return;
    }

    const areEvaluationsValid: Array<EvaluationModel> = this.evaluations.filter((evaluation: EvaluationModel) => {
      return this.evaluationIsValid(evaluation);
    });
    // PendingEvaluations
    if (areEvaluationsValid.length !== this.evaluations.length) {
      this.status = GlobalEvaluationStatus.EvaluationStarted; // 5
      return;
    }
    // EvaluationsCompleted
    if (areEvaluationsValid.length === this.evaluations.length && evaluationToBeFixed.length === 0) {
      this.status = GlobalEvaluationStatus.EvaluationCompleted; // 6
    }

    const evaluationsCompleted: Array<EvaluationModel> = this.evaluations.filter((evaluation: EvaluationModel) => {
      return evaluation.isCompleted();
    });

    if (evaluationsCompleted.length === this.evaluations.length) {
      if (!this.pia.validationIsCompleted()) {
        this.status = GlobalEvaluationStatus.ValidationRequested; // 7
      } else {
        this.status = GlobalEvaluationStatus.ValidationCompleted; // 8
      }
    }
  }

  /**
   * Is the answer valid?
   * @private
   * @param {AnswerModel} answer - An Answer.
   * @returns {boolean}
   * @memberof GlobalEvaluationService
   */
  private answerIsValid(answer: AnswerModel) {
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
      valid = answer.isValidForType(answer_type);
    }

    return valid;
  }

  /**
   * Is the evaluation valid?
   * @private
   * @param {EvaluationModel} evaluation - An Evaluation.
   * @returns {boolean}
   * @memberof GlobalEvaluationService
   */
  private evaluationIsValid(evaluation: EvaluationModel) {
    if (evaluation.isToBeFixed()) {
      return evaluation.hasEvaluationComment();
    }

    if (evaluation.isImprovable()) {

      if (this.item.evaluation_mode === 'question') {
        return evaluation.hasActionPlanComment();
      }

      if (this.item.evaluation_mode === 'item' && this.item.evaluation_with_gauge === true) {
        if (evaluation.hasAssignedGauges() && evaluation.hasActionPlanComment()) {
          return true;
        }
      }
    }
    return evaluation.isAcceptable();
  }

  /**
   * Verification for all answers.
   * @private
   * @returns {Promise}
   * @memberof GlobalEvaluationService
   */
  private async answersVerification() {
    const count = 0;
    this.answersOrMeasures = [];
    return new Promise(async (resolve, reject) => {
      if (this.item.is_measure) {
        const measures: MeasureModel[] = await this.measureApi.getAll(this.pia.id).toPromise();
        if (measures.length > 0) {
          this.questionsOrMeasures = measures;
          measures.forEach(measure => {
            if (measure.hasValidTitleAndContent()) {
              this.answersOrMeasures.push(measure);
            }
          });
        }
        resolve();

      } else {
        this.questionsOrMeasures = this.item.questions;

        if (this.item.questions) {
          const theAnswers = await this.answerApi.getAll(this.pia.id).toPromise();

          this.item.questions.forEach((question: any) => {
            const theRefAnswer = theAnswers.find((item) => item.reference_to == question.id);
            if (theRefAnswer) {
              this.answersOrMeasures.push(theRefAnswer);
            }
          });
        }
        resolve();
      }
    });
  }

  /**
   * Verification for all evaluations.
   * @private
   * @returns {Promise}
   * @memberof GlobalEvaluationService
   */
  private async evaluationsVerification() {
    const count = 0;
    this.evaluations = [];
    return new Promise(async (resolve, reject) => {

      if (this.item.evaluation_mode === 'item') {

        const theEval = await this.evaluationApi.getByRef(this.pia.id, this.reference_to).toPromise();
        this.evaluations = theEval ? [theEval] : [];
        return resolve();

      } else if (this.item.is_measure) {

        const theMeasures = await this.measureApi.getAll(this.pia.id).toPromise();
        const theEvaluations = await this.evaluationApi.getAll(this.pia.id).toPromise();

        if (theMeasures && theMeasures.length > 0) {
          theMeasures.forEach(measure => {
            const theRefEval = theEvaluations.find((item) => item.reference_to == (this.reference_to + '.' + measure.id));
            if (theRefEval) {
              this.evaluations.push(theRefEval);
            }
          });
          return resolve();
        }
      } else if (this.item.evaluation_mode === 'question') {

        const theAnswers = await this.answerApi.getAll(this.pia.id).toPromise();
        const theEvaluations = await this.evaluationApi.getAll(this.pia.id).toPromise();

        this.item.questions.forEach(question => {
          const theRefAnswer = theAnswers.find((item) => item.reference_to == question.id);
          if (theRefAnswer) {
            const theRefEval = theEvaluations.find((item) => item.reference_to == (this.reference_to + '.' + theRefAnswer.reference_to));
            if (theRefEval) {
              this.evaluations.push(theRefEval);
            }
          }
        });
        return resolve();
      }
    });
  }

  /**
   * Delete evaluation in database.
   * @private
   * @param {string} reference_to - The reference.
   * @returns {Promise}
   * @memberof GlobalEvaluationService
   */
  private async deleteEvaluationInDb(reference_to: string) {

    return new Promise(async (resolve, reject) => {
      const theRefEval = await this.evaluationApi.getByRef(this.pia.id, reference_to).toPromise();
      if (theRefEval) {
        await this.evaluationApi.delete(theRefEval).toPromise();
      }
      resolve();
    });
  }

  /**
   * Set answer edition by status.
   * @memberof GlobalEvaluationService
   */
  setAnswerEditionEnabled() {
    this.answerEditionEnabled = [
      GlobalEvaluationStatus.AnswersNone, // 0
      GlobalEvaluationStatus.AnswersStarted, // 1
      GlobalEvaluationStatus.AnswersCompleted, // 2
      GlobalEvaluationStatus.AnswersToBeFixed, // 3
    ].includes(this.status);
  }

  /**
   * Set evaluation edition by status.
   * @memberof GlobalEvaluationService
   */
  setEvaluationEditionEnabled() {
    this.evaluationEditionEnabled = [
      GlobalEvaluationStatus.EvaluationRequested, // 4
      GlobalEvaluationStatus.EvaluationStarted, // 5
      GlobalEvaluationStatus.EvaluationCompleted, // 6
    ].includes(this.status);
  }
}

export enum GlobalEvaluationStatus {
  AnswersNone = 0,
  AnswersStarted = 1,
  AnswersCompleted = 2,
  AnswersToBeFixed = 3,
  EvaluationRequested = 4,
  EvaluationStarted = 5,
  EvaluationCompleted = 6,
  ValidationRequested = 7,
  ValidationCompleted = 8

}
