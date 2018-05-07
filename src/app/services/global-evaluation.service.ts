import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PiaService } from 'app/entry/pia.service';
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
  public status: number = 0;
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
            if (theEval.status === 0) {
              await this.validate();
              resolve(false);
            }
            if (theEval.status === 1) {
              theEval.global_status = 1;
            } else {
              theEval.global_status = 2;
            }
            this.evaluationApi.update(theEval).subscribe(async (updatedEval: EvaluationModel) => {
              await this.validate();
              resolve(updatedEval.status === 1);
            });
          });

      } else if (this.answersOrMeasures.length > 0) {
        let count = 0;
        let toFix = false;
        this.answersOrMeasures.forEach((answerOrMeasure) => {

          this.evaluationApi.getByRef(this.pia.id, this.getAnswerReferenceTo(answerOrMeasure))
            .subscribe(async (theEval: EvaluationModel) => {
              if (theEval.status > 0) {
                if (theEval.status === 1) {
                  theEval.global_status = 1;
                  toFix = true;
                } else {
                  theEval.global_status = 2;
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
  cancelValidation() {
    if (this.item.evaluation_mode === 'item') {

      this.evaluationApi.getByRef(this.pia.id, this.reference_to)
        .subscribe(async (theEval: EvaluationModel) => {
          theEval.global_status = 1;
          this.evaluationApi.update(theEval)
            .subscribe(async (updatedEval: EvaluationModel) => {
              this.validate();
            });
        });
    } else if (this.answersOrMeasures.length > 0) {
      let count = 0;
      this.answersOrMeasures.forEach((answerOrMeasure) => {
        this.evaluationApi.getByRef(this.pia.id, this.getAnswerReferenceTo(answerOrMeasure))
          .subscribe(async (theEval: EvaluationModel) => {
            theEval.global_status = 1;
            this.evaluationApi.update(theEval)
              .subscribe(async (updatedEval: EvaluationModel) => {
                count++;
                if (count === this.answersOrMeasures.length) {
                  this.validate();
                }
              });
          });

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
    return new Promise((resolve, reject) => {
      const reference_to = new_reference_to ? new_reference_to : this.reference_to;

      this.evaluationApi.getByRef(this.pia.id, reference_to)
        .subscribe((theEval: EvaluationModel) => {
          if (!theEval) {
            const newEval = new EvaluationModel();
            newEval.pia_id = this.pia.id;
            newEval.reference_to = reference_to;
            this.evaluationApi.create(newEval).subscribe(() => {
              resolve();
            });
          } else if (theEval.status === 1) {
            theEval.global_status = 0;
            this.evaluationApi.update(theEval).subscribe(() => {
              resolve();
            });
          } else {
            resolve();
          }
        });
    });
  }

  /**
   * Do a global verification.
   * @private
   * @memberof GlobalEvaluationService
   */
  private verification() {
    if (!this.answersOrMeasures) {
      return;
    }
    const answersOrMeasuresValid: Array<AnswerModel | MeasureModel> = this.answersOrMeasures.filter((answerOrMeasure: any) => {
      if (answerOrMeasure.data !== undefined) {
        return this.answerIsValid(answerOrMeasure);
      } else {
        return this.measureIsValid(answerOrMeasure);
      }
    });
    if (this.answersOrMeasures.length > 0 && answersOrMeasuresValid.length === this.questionsOrMeasures.length) {
      if (this.evaluations.length === 0) {
        this.status = 2;
      } else {
        const evaluationsStarted: Array<EvaluationModel> = this.evaluations.filter((evaluation: EvaluationModel) => {
          return this.evaluationStarted(evaluation);
        });
        if (evaluationsStarted.length === this.evaluations.length) {
          const evaluationsCompleted: Array<EvaluationModel> = this.evaluations.filter((evaluation: EvaluationModel) => {
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
            const evaluationToBeFixed: Array<EvaluationModel> = this.evaluations.filter((evaluation: EvaluationModel) => {
              return this.evaluationsToBeFixed(evaluation);
            });
            if (evaluationToBeFixed.length > 0) {
              this.status = 3;
            } else {
              const evaluationsIsValid: Array<EvaluationModel> = this.evaluations.filter((evaluation: EvaluationModel) => {
                return this.evaluationIsValid(evaluation);
              });
              if (evaluationsIsValid.length > 0 && evaluationsIsValid.length === this.evaluations.length) {
                this.status = 6;
              } else {
                this.status = 5;
              }
            }
          }
        } else {

          const evaluationsNotStarted: Array<EvaluationModel> = this.evaluations.filter((evaluation: EvaluationModel) => {
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
   * @param {EvaluationModel} evaluation - An Evaluation.
   * @returns {boolean}
   * @memberof GlobalEvaluationService
   */
  private evaluationsToBeFixed(evaluation: EvaluationModel) {
    if (evaluation.status === 1 && evaluation.global_status === 1) {
      return true;
    }
    return false;
  }

  /**
   * The evaluation is started?
   * @private
   * @param {EvaluationModel} evaluation - An Evaluation.
   * @returns {boolean}
   * @memberof GlobalEvaluationService
   */
  private evaluationStarted(evaluation: EvaluationModel) {
    if (evaluation.status > 0) {
      return true;
    }
    return false;
  }

  /**
   * The evaluation is completed?
   * @private
   * @param {EvaluationModel} evaluation - An Evaluation.
   * @returns {boolean}
   * @memberof GlobalEvaluationService
   */
  private evaluationCompleted(evaluation: EvaluationModel) {
    if (evaluation.status > 1 && evaluation.global_status === 2) {
      return true;
    }
    return false;
  }

  /**
   * The evaluation isn't started?
   * @private
   * @param {EvaluationModel} evaluation - An Evaluation.
   * @returns {boolean}
   * @memberof GlobalEvaluationService
   */
  private evaluationNotStarted(evaluation: EvaluationModel) {
    if (evaluation.status === 0) {
      return true;
    }
    return false;
  }

  /**
   * Is the measure valid?
   * @private
   * @param {MeasureModel} measure - A Measure.
   * @returns {boolean}
   * @memberof GlobalEvaluationService
   */
  private measureIsValid(measure: MeasureModel) {
    if (measure.content && measure.content.length > 0 ||
      measure.title && measure.title.length > 0) {
      return true;
    }
    return false;
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
   * @param {EvaluationModel} evaluation - An Evaluation.
   * @returns {boolean}
   * @memberof GlobalEvaluationService
   */
  private evaluationIsValid(evaluation: EvaluationModel) {
    if (evaluation.status === 1) {
      return evaluation.evaluation_comment && evaluation.evaluation_comment.length > 0;
    } else if (evaluation.status === 2) {
      if (this.item.evaluation_mode === 'question') {
        return evaluation.action_plan_comment && evaluation.action_plan_comment.length > 0;
      }
      if (this.item.evaluation_mode === 'item' && this.item.evaluation_with_gauge === true) {
        if (evaluation.gauges && evaluation.gauges['x'] > 0 && evaluation.gauges['y'] > 0
          && evaluation.action_plan_comment && evaluation.action_plan_comment.length > 0) {
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
   * @memberof GlobalEvaluationService
   */
  private async answersVerification() {
    let count = 0;
    this.answersOrMeasures = [];
    return new Promise((resolve, reject) => {
      if (this.item.is_measure) {

        this.measureApi.getAll(this.pia.id).subscribe((measures: MeasureModel[]) => {
          if (measures && measures.length > 0) {
            this.questionsOrMeasures = measures;
            measures.forEach(measure => {
              count++;
              if (measure.title && measure.title.length > 0 && measure.content && measure.content.length > 0) {
                this.answersOrMeasures.push(measure);
              }
              if (count === measures.length) {
                resolve();
              }
            });
          } else {
            resolve();
          }
        });

      } else {
        this.questionsOrMeasures = this.item.questions;
        if (this.item.questions) {
          this.item.questions.forEach((question: any) => {
            this.answerApi.getByRef(this.pia.id, question.id).subscribe((theAnswer: AnswerModel) => {
              count++;
              if (theAnswer) {
                this.answersOrMeasures.push(theAnswer);
              }
              if (count === this.item.questions.length) {
                resolve();
              }
            });

          });
        } else {
          resolve();
        }
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
    let count = 0;
    this.evaluations = [];
    return new Promise((resolve, reject) => {
      if (this.item.evaluation_mode === 'item') {

        this.evaluationApi.getByRef(this.pia.id, this.reference_to).subscribe((theEval: EvaluationModel) => {
          
          this.evaluations = theEval ? [theEval] : [];
          resolve();
        });

      } else if (this.item.is_measure) {

        this.measureApi.getAll(this.pia.id).subscribe((theMeasures: MeasureModel[]) => {
          if (theMeasures && theMeasures.length > 0) {
            theMeasures.forEach(measure => {

              this.evaluationApi.getByRef(this.pia.id, this.reference_to + '.' + measure.id)
                .subscribe((theEval: EvaluationModel) => {
                  count++;
                  if (theEval) {
                    this.evaluations.push(theEval);
                  }
                  if (count === theMeasures.length) {
                    resolve();
                  }
                });
            });
          } else {
            resolve();
          }
        });
      } else if (this.item.evaluation_mode === 'question') {
        this.item.questions.forEach(question => {

          this.answerApi.getByRef(this.pia.id, question.id).subscribe((theAnswer: AnswerModel) => {
            if (theAnswer) {
              this.evaluationApi.getByRef(this.pia.id, this.reference_to + '.' + theAnswer.reference_to)
                .subscribe((theEval: EvaluationModel) => {
                  count++;
                  if (theEval) {
                    this.evaluations.push(theEval);
                  }
                  if (count === this.item.questions.length) {
                    resolve();
                  }
                });
            } else {
              resolve();
            }
          });
        });
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

    return new Promise((resolve, reject) => {

      this.evaluationApi.getByRef(this.pia.id, reference_to).subscribe((theEval: EvaluationModel) => {
        if (theEval) {
          this.evaluationApi.delete(theEval).subscribe(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Set answer edition by status.
   * @memberof GlobalEvaluationService
   */
  setAnswerEditionEnabled() {
    this.answerEditionEnabled = [0, 1, 2, 3].includes(this.status);
  }

  /**
   * Set evaluation edition by status.
   * @memberof GlobalEvaluationService
   */
  setEvaluationEditionEnabled() {
    this.evaluationEditionEnabled = [4, 5, 6].includes(this.status);
  }
}
