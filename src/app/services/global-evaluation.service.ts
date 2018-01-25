import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Answer} from '../entry/entry-content/questions/answer.model';
import {Evaluation} from '../entry/entry-content/evaluations/evaluation.model';
import {Measure} from '../entry/entry-content/measures/measure.model';
import {Pia} from '../entry/pia.model';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GlobalEvaluationService {
  public pia: Pia;
  public section: any;
  public item: any;
  public status: number;
  public answerEditionEnabled = false;
  public evaluationEditionEnabled = false;
  public reference_to: string;
  public enablePiaValidation: boolean;
  public piaIsRefused: boolean;
  private questionsOrMeasures: Array<any>;
  private answersOrMeasures: Array<Answer|Measure>;
  private evaluations: Array<Evaluation>;

  public behaviorSubject = new BehaviorSubject<Object>({});

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

  async prepareForEvaluation() {
    return new Promise(async (resolve, reject) => {
      if (this.item.evaluation_mode === 'item') {
        await this.createOrUpdateEvaluation();
        await this.validate();
        resolve();
      } else {
        await this.answersVerification();
        let count = 0;
        this.answersOrMeasures.forEach(async (answerOrMeasure: Answer|Measure) => {
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

  async validateAllEvaluation() {
    return new Promise((resolve, reject) => {
      if (this.item.evaluation_mode === 'item') {
        const evaluation = new Evaluation();
        evaluation.getByReference(this.pia.id, this.reference_to).then(async () => {
          if (evaluation.status === 0) {
            await this.validate();
            resolve(false);
          }
          if (evaluation.status === 1) {
            evaluation.global_status = 1;
          } else {
            evaluation.global_status = 2;
          }
          evaluation.update().then(async() => {
            await this.validate();
            resolve(evaluation.status === 1);
          });
        });
      } else if (this.answersOrMeasures.length > 0) {
        let count = 0;
        let toFix = false;
        this.answersOrMeasures.forEach((answerOrMeasure) => {
          const evaluation = new Evaluation();
          evaluation.getByReference(this.pia.id, this.getAnswerReferenceTo(answerOrMeasure)).then(async() => {
            if (evaluation.status > 0) {
              if (evaluation.status === 1) {
                evaluation.global_status = 1;
                toFix = true;
              } else {
                evaluation.global_status = 2;
              }
              evaluation.update().then(async () => {
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

  cancelValidation() {
    if (this.item.evaluation_mode === 'item') {
      const evaluation = new Evaluation();
      evaluation.getByReference(this.pia.id, this.reference_to).then(() => {
        evaluation.global_status = 1;
        evaluation.update().then(() => {
          this.validate();
        });
      });
    } else if (this.answersOrMeasures.length > 0) {
      let count = 0;
      this.answersOrMeasures.forEach((answerOrMeasure) => {
        const evaluation = new Evaluation();
        evaluation.getByReference(this.pia.id, this.getAnswerReferenceTo(answerOrMeasure)).then(() => {
          evaluation.global_status = 1;
          evaluation.update().then(() => {
            count++;
            if (count === this.answersOrMeasures.length) {
              this.validate();
            }
          });
        });
      });
    }
  }

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

  private async createOrUpdateEvaluation(new_reference_to?: string) {
    return new Promise((resolve, reject) => {
      const reference_to = new_reference_to ? new_reference_to : this.reference_to;
      const evaluation = new Evaluation();
      evaluation.getByReference(this.pia.id, reference_to).then((result: any) => {
        if (!result) {
          evaluation.pia_id = this.pia.id;
          evaluation.reference_to = reference_to;
          evaluation.create().then(() => {
            resolve();
          });
        } else if (evaluation.status === 1) {
          evaluation.global_status = 0;
          evaluation.update().then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  private verification() {
    if (!this.answersOrMeasures) {
      return;
    }
    const answersOrMeasuresValid: Array<Answer|Measure> = this.answersOrMeasures.filter((answerOrMeasure: any) => {
      if (answerOrMeasure.data !== undefined) {
        return this.answerIsValid(answerOrMeasure);
      } else {
        return this.measureIsValid(answerOrMeasure);
      }
      // TODO Need to use the code below instead of the one above. For this we need in all the findAll()
      // methods to return an instance of the class instead of a simple json.
      // if (answerOrMeasure instanceof Answer) {
      //   return this.answerIsValid(answerOrMeasure);
      // } else if (answerOrMeasure instanceof Measure) {
      //   return this.measureIsValid(answerOrMeasure);
      // }
    });
    if (this.answersOrMeasures.length > 0 && answersOrMeasuresValid.length === this.questionsOrMeasures.length) {
      if (this.evaluations.length === 0) {
        this.status = 2;
      } else {
        const evaluationsStarted: Array<Evaluation> = this.evaluations.filter((evaluation: Evaluation) => {
          return this.evaluationStarted(evaluation);
        });
        if (evaluationsStarted.length === this.evaluations.length) {
          const evaluationsCompleted: Array<Evaluation> = this.evaluations.filter((evaluation: Evaluation) => {
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
            const evaluationToBeFixed: Array<Evaluation> = this.evaluations.filter((evaluation: Evaluation) => {
              return this.evaluationsToBeFixed(evaluation);
            });
            if (evaluationToBeFixed.length > 0) {
              this.status = 3;
            } else {
              const evaluationsIsValid: Array<Evaluation> = this.evaluations.filter((evaluation: Evaluation) => {
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
          const evaluationsNotStarted: Array<Evaluation> = this.evaluations.filter((evaluation: Evaluation) => {
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

  private evaluationsToBeFixed(evaluation: Evaluation) {
    if (evaluation.status === 1 && evaluation.global_status === 1) {
      return true;
    }
    return false;
  }

  private evaluationStarted(evaluation: Evaluation) {
    if (evaluation.status > 0) {
      return true;
    }
    return false;
  }

  private evaluationCompleted(evaluation: Evaluation) {
    if (evaluation.status > 1 && evaluation.global_status === 2) {
      return true;
    }
    return false;
  }

  private evaluationNotStarted(evaluation: Evaluation) {
    if (evaluation.status === 0) {
      return true;
    }
    return false;
  }

  private measureIsValid(measure: Measure) {
    if (measure.content && measure.content.length > 0 ||
        measure.title && measure.title.length > 0) {
      return true;
    }
    return false;
  }

  private answerIsValid(answer: Answer) {
    if (answer.data.text && answer.data.text.length > 0 ||
        answer.data.list && answer.data.list.length > 0 ||
        answer.data.text && answer.data.gauge && answer.data.text.length > 0 && answer.data.gauge > 0) {
      return true;
    }
    return false;
  }

  private evaluationIsValid(evaluation: Evaluation) {
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

  private async answersVerification() {
    let count = 0;
    this.answersOrMeasures = [];
    return new Promise((resolve, reject) => {
      if (this.item.is_measure) {
        const measureModel = new Measure();
        measureModel.pia_id = this.pia.id;
        measureModel.findAll().then((measures: any[]) => {
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
            const answerModel = new Answer();
            answerModel.getByReferenceAndPia(this.pia.id, question.id).then((result: boolean) => {
              count++;
              if (result) {
                this.answersOrMeasures.push(answerModel);
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

  private async evaluationsVerification() {
    let count = 0;
    this.evaluations = [];
    return new Promise((resolve, reject) => {
      if (this.item.evaluation_mode === 'item') {
        const evaluationModel = new Evaluation();
        evaluationModel.getByReference(this.pia.id, this.reference_to).then((result: any) => {
          this.evaluations = result ? [evaluationModel] : [];
          resolve();
        });
      } else if (this.item.is_measure) {
        const measureModel = new Measure();
        measureModel.pia_id = this.pia.id;
        measureModel.findAll().then((measures: any) => {
          if (measures && measures.length > 0) {
            measures.forEach(measure => {
              const evaluationModel = new Evaluation();
              evaluationModel.getByReference(this.pia.id, this.reference_to + '.' + measure.id).then((result: any) => {
                count++;
                if (result) {
                  this.evaluations.push(evaluationModel);
                }
                if (count === measures.length) {
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
          const answerModel = new Answer();
          answerModel.getByReferenceAndPia(this.pia.id, question.id).then((result: any) => {
            if (result) {
              const evaluationModel = new Evaluation();
              evaluationModel.getByReference(this.pia.id, this.reference_to + '.' + answerModel.reference_to).then((result2: any) => {
                count++;
                if (result2) {
                  this.evaluations.push(evaluationModel);
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

  private async deleteEvaluationInDb(reference_to: string) {
    const evaluation = new Evaluation();
    return new Promise((resolve, reject) => {
      evaluation.getByReference(this.pia.id, reference_to).then((entry: any) => {
        if (entry !== false) {
          evaluation.delete(evaluation.id).then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  setAnswerEditionEnabled() {
    this.answerEditionEnabled = [0, 1, 2, 3].includes(this.status);
  }

  setEvaluationEditionEnabled() {
    this.evaluationEditionEnabled = [4, 5, 6].includes(this.status);
  }
}
