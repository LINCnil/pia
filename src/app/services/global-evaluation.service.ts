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
  private answerService;
  private evaluationService;
  private measureService;

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
    this.reference_to = this.section.id + '.' + this.item.id;
    return new Promise(async (resolve, reject) => {
      if (
        this.item.evaluation_mode === 'item' ||
        this.item.evaluation_mode === 'question'
      ) {
        if (this.pia) {
          // We apply this only to PIAs, not to Structures
          await this.evaluationsVerification();
          await this.answersVerification();
        }
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
   */
  async prepareForEvaluation(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.item.evaluation_mode === 'item') {
        await this.createOrUpdateEvaluation();
        await this.validate();
        resolve();
      } else {
        await this.answersVerification();
        let count = 0;
        for (const answerOrMeasure of this.answersOrMeasures) {
          count++;
          await this.createOrUpdateEvaluation(
            this.getAnswerReferenceTo(answerOrMeasure)
          );

          if (count === this.answersOrMeasures.length) {
            await this.validate();
          }
        }
        resolve();
      }
    });
  }

  /**
   * Validate all evaluations.
   * @returns {Promise}
   */
  async validateAllEvaluation(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.evaluationService.pia_id = this.pia.id;
      if (this.item.evaluation_mode === 'item') {
        this.evaluationService
          .getByReference(this.pia.id, this.reference_to)
          .then(async (evaluation: Evaluation) => {
            if (evaluation.status === 0) {
              await this.validate();
              resolve(false);
            }
            if (evaluation.status === 1) {
              evaluation.global_status = 1;
            } else {
              evaluation.global_status = 2;
            }

            evaluation.evaluation_infos = JSON.stringify(this.item);
            this.evaluationService
              .update(evaluation)
              .then(async () => {
                await this.validate();
                resolve(evaluation.status === 1);
              })
              .catch(err => {
                reject(err);
              });
          });
      } else if (this.answersOrMeasures.length > 0) {
        let count = 0;
        let toFix = false;

        for (const answerOrMeasure of this.answersOrMeasures) {
          await this.evaluationService
            .getByReference(
              this.pia.id,
              this.getAnswerReferenceTo(answerOrMeasure)
            )
            .then(async (evaluation: Evaluation) => {
              if (evaluation.status > 0) {
                if (evaluation.status === 1) {
                  evaluation.global_status = 1;
                  toFix = true;
                } else {
                  evaluation.global_status = 2;
                }

                evaluation.evaluation_infos = JSON.stringify(this.item);
                this.evaluationService
                  .update(evaluation)
                  .then(async () => {
                    count++;
                    if (count === this.answersOrMeasures.length) {
                      await this.validate();
                    }
                  })
                  .catch(err => {
                    console.log('erro update');
                  });
              } else {
                await this.validate();
              }
            });
        }
        resolve(toFix);
      }
    });
  }

  /**
   * Cancel evaluation and return in edit mode.
   */
  cancelForEvaluation(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (this.item.evaluation_mode === 'item') {
        this.deleteEvaluationInDb(this.reference_to)
          .then(async () => {
            await this.validate();
            resolve(true);
          })
          .catch(err => {
            reject(err);
          });
      } else if (this.answersOrMeasures.length > 0) {
        let count = 0;
        for (const answerOrMeasure of this.answersOrMeasures) {
          this.deleteEvaluationInDb(this.getAnswerReferenceTo(answerOrMeasure))
            .then(async () => {
              count++;
              if (count === this.answersOrMeasures.length) {
                await this.validate();
              }
              // resolve(true);
            })
            .catch(() => {
              // reject(true);
            });
        }
        resolve(true);
      }
    });
  }

  /**
   * Cancel validation and return in evaluation mode.
   */
  cancelValidation(piaId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.evaluationService.pia_id = piaId;
      if (this.item.evaluation_mode === 'item') {
        this.evaluationService
          .getByReference(this.pia.id, this.reference_to)
          .then((evaluation: Evaluation) => {
            evaluation.global_status = 1;
            this.evaluationService.update(evaluation).then(async () => {
              await this.validate();
              resolve(evaluation);
            });
          });
      } else if (this.answersOrMeasures.length > 0) {
        let count = 0;
        for (const answerOrMeasure of this.answersOrMeasures) {
          this.evaluationService
            .getByReference(
              this.pia.id,
              this.getAnswerReferenceTo(answerOrMeasure)
            )
            .then((evaluation: Evaluation) => {
              evaluation.global_status = 1;
              this.evaluationService.update(evaluation).then(() => {
                count++;
                if (count === this.answersOrMeasures.length) {
                  this.validate();
                }
              });
            });
        }
        resolve(true);
      }
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
  private getAnswerReferenceTo(answerOrMeasure): string {
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
   * Create a new evaluation or update it.
   * @private
   * @param {string} [new_reference_to] - The reference.
   * @returns {Promise}
   */
  private async createOrUpdateEvaluation(
    new_reference_to?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.evaluationService.pia_id = this.pia.id;
      const reference_to = new_reference_to
        ? new_reference_to
        : this.reference_to;
      this.evaluationService
        .getByReference(this.pia.id, reference_to)
        .then((evaluation: Evaluation) => {
          if (!evaluation) {
            const newEvaluation = new Evaluation();
            newEvaluation.pia_id = this.pia.id;
            newEvaluation.reference_to = reference_to;
            newEvaluation.evaluation_infos = JSON.stringify(this.item);
            this.evaluationService.create(newEvaluation).then(entry => {
              resolve(entry);
            });
          } else if (evaluation.status === 1) {
            evaluation.global_status = 0;
            this.evaluationService.update(evaluation).then(() => {
              resolve(evaluation);
            });
          } else {
            resolve(evaluation);
          }
        });
    });
  }

  /**
   * Do a global verification.
   * @private
   */
  private verification(): void {
    if (!this.answersOrMeasures) {
      return;
    }
    const answersOrMeasuresValid: Array<
      Answer | Measure
    > = this.answersOrMeasures.filter((answerOrMeasure: any) => {
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
          const evaluationsCompleted: Array<Evaluation> = this.evaluations.filter(
            (evaluation: Evaluation) => {
              return this.evaluationCompleted(evaluation);
            }
          );
          if (evaluationsCompleted.length === this.evaluations.length) {
            if (this.pia.status >= 2) {
              this.status = 8;
            } else {
              this.status = 7;
            }
          } else {
            // If we have one or more evaluation status "toBeFixed"
            const evaluationToBeFixed: Array<Evaluation> = this.evaluations.filter(
              (evaluation: Evaluation) => {
                return this.evaluationsToBeFixed(evaluation);
              }
            );
            if (evaluationToBeFixed.length > 0) {
              this.status = 3;
            } else {
              const evaluationsIsValid: Array<Evaluation> = this.evaluations.filter(
                (evaluation: Evaluation) => {
                  return this.evaluationIsValid(evaluation);
                }
              );
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
          const evaluationsNotStarted: Array<Evaluation> = this.evaluations.filter(
            (evaluation: Evaluation) => {
              return this.evaluationNotStarted(evaluation);
            }
          );
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
    const question = this.item.questions.filter(q => {
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
  private async answersVerification(): Promise<any> {
    return new Promise((resolve, reject) => {
      let count = 0;
      this.answersOrMeasures = [];
      this.answerService.pia_id = this.pia.id;
      this.measureService.pia_id = this.pia.id;
      if (this.item.is_measure) {
        this.measureService
          .findAllByPia(this.pia.id)
          .then((measures: any[]) => {
            if (measures && measures.length > 0) {
              this.questionsOrMeasures = measures;
              measures.forEach(measure => {
                count++;
                if (
                  measure.title &&
                  measure.title.length > 0 &&
                  measure.content &&
                  measure.content.length > 0
                ) {
                  this.answersOrMeasures.push(measure);
                }
                if (count === measures.length) {
                  resolve(measures);
                }
              });
            } else {
              resolve(measures);
            }
          });
      } else {
        this.questionsOrMeasures = this.item.questions;
        if (this.item.questions) {
          this.item.questions.forEach((question: any) => {
            this.answerService
              .getByReferenceAndPia(this.pia.id, question.id)
              .then(result => {
                count++;
                if (result) {
                  this.answersOrMeasures.push(result);
                }
                if (
                  this.item.questions &&
                  count === this.item.questions.length
                ) {
                  resolve(result);
                }
              });
          });
        } else {
          resolve(true);
        }
      }
    });
  }

  /**
   * Verification for all evaluations.
   * @private
   * @returns {Promise}
   */
  private async evaluationsVerification(): Promise<any> {
    return new Promise((resolve, reject) => {
      let count = 0;
      this.evaluations = [];
      this.evaluationService.pia_id = this.pia.id;
      this.measureService.pia_id = this.pia.id;
      if (this.item.evaluation_mode === 'item') {
        this.evaluationService
          .getByReference(this.pia.id, this.reference_to)
          .then((evaluationModel: any) => {
            this.evaluations = evaluationModel ? [evaluationModel] : [];
            resolve(evaluationModel);
          });
      } else if (this.item.is_measure) {
        this.measureService.findAllByPia(this.pia.id).then((measures: any) => {
          if (measures && measures.length > 0) {
            measures.forEach(measure => {
              this.evaluationService
                .getByReference(
                  this.pia.id,
                  this.reference_to + '.' + measure.id
                )
                .then((evaluationModel: any) => {
                  count++;
                  if (evaluationModel) {
                    this.evaluations.push(evaluationModel);
                  }
                  if (count === measures.length) {
                    resolve(true);
                  }
                });
            });
          } else {
            resolve(true);
          }
        });
      } else if (this.item.evaluation_mode === 'question') {
        this.item.questions.forEach(question => {
          this.answerService
            .getByReferenceAndPia(this.pia.id, question.id)
            .then((evaluationModel1: Answer) => {
              if (evaluationModel1) {
                this.evaluationService
                  .getByReference(
                    this.pia.id,
                    this.reference_to + '.' + evaluationModel1.reference_to
                  )
                  .then((evaluationModel2: any) => {
                    count++;
                    if (evaluationModel2) {
                      this.evaluations.push(evaluationModel2);
                    }
                    if (count === this.item.questions.length) {
                      resolve(true);
                    }
                  });
              } else {
                resolve(true);
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
   */
  private async deleteEvaluationInDb(reference_to: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.evaluationService.pia_id = this.pia.id;
      this.evaluationService
        .getByReference(this.pia.id, reference_to)
        .then((evaluation: any) => {
          if (evaluation !== false) {
            this.evaluationService.delete(evaluation.id).then(() => {
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
