import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Pia } from 'app/entry/pia.model';

import { PaginationService } from 'app/entry/entry-content/pagination.service';
import { ModalsService } from 'app/modals/modals.service';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';

@Injectable()
export class EvaluationService {

  section: any;
  item: any;
  enableEvaluation = false;
  showValidationButton = false;
  enableFinalValidation = false;
  answers: any[] = [];
  answer: Answer = new Answer();
  measure: Measure = new Measure();
  pia: Pia;

  constructor(private _modalsService: ModalsService,
              private _paginationService: PaginationService,
              private _globalEvaluationService: GlobalEvaluationService,
              private _router: Router) { }

  async setPia(pia: Pia) {
    this.pia = pia;
    this.measure.pia_id = pia.id;
  }

  allowEvaluation() {
    this.enableEvaluation = false;
    this.showValidationButton = false;
    this.enableFinalValidation = false;
    this.answers = [];
    if (this.item) {
      this.setAnswers(this.item, true).then((answers: any) => {
        this.answers = answers;
        this.allAwsersIsInEvaluation(this.section, this.item);
      });
    }
  }

  private async setAnswers(item, checkNext?) {
    let answers = [];
    return new Promise((resolve, reject) => {
      if (item.is_measure) {
        // For measures
        this.measure.findAll().then((measures: any[]) => {
          if (measures.length > 0) {
            measures.forEach(measure => {
              if (measure.title && measure.title.length > 0 && measure.content && measure.content.length > 0) {
                answers.push(measure.id);
              }
            });
            if (checkNext) {
              this.enableEvaluation = answers.length === measures.length ? true : false;
            }
            resolve(answers);
          }
        });
      } else if (item.questions) {
        // For questions and item evaluation_mode
        const questionsIds = [];
        const answerTypeByQuestion = {};
        item.questions.forEach(question => {
          questionsIds.push(question.id.toString());
          answerTypeByQuestion[question.id] = question.answer_type;
        });
        this.answer.findAllByPia(this.pia.id).then((answers2: any) => {
          answers = answers2.filter((answer) => {
            let contentOk = false;
            if (answerTypeByQuestion[answer.reference_to] === 'text'  ) {
              contentOk = answer.data.text && answer.data.text.length > 0;
            } else if (answerTypeByQuestion[answer.reference_to] === 'list') {
              contentOk = answer.data.list && answer.data.list.length > 0;
            } else if (answerTypeByQuestion[answer.reference_to] === 'gauge') {
              contentOk = answer.data.text && answer.data.gauge && answer.data.text.length > 0 && answer.data.gauge > 0;
            }
            return (contentOk && questionsIds.indexOf(answer.reference_to.toString()) >= 0);
          });
          if (checkNext) {
            this.enableEvaluation = answers.length === questionsIds.length ? true : false;
          }
          resolve(answers);
        });
      }
    });
  }

  /**
   * Allows an user to ask an evaluation for a section.
   */
  async prepareForEvaluation(piaService: any, sidStatusService: any, section: any, item: any) {
    // Creates evaluations according to evaluation_mode
    if (this.item.evaluation_mode === 'item') {
      this.createEvaluationInDb(section.id + '.' + item.id).then(() => {
        sidStatusService.setSidStatus(piaService, section, item);
        this._globalEvaluationService.checkForFinalValidation(piaService.pia, section, item);
        this.allAwsersIsInEvaluation(section, item);
      });
    } else {
      let count = 0;
      const countAnswers = this.answers.length;
      this.answers.forEach((answer) => {
        return new Promise((resolve, reject) => {
          let reference_to = null;
          reference_to = section.id + '.' + item.id + '.' + answer.reference_to;
          if (item.is_measure) {
            reference_to = section.id + '.' + item.id + '.' + answer;
          }
          this.createEvaluationInDb(reference_to).then(() => {
            count += 1;
            resolve();
          });
        }).then(() => {
          if (count ===  countAnswers) {
            sidStatusService.setSidStatus(piaService, section, item);
            this._globalEvaluationService.checkForFinalValidation(piaService.pia, section, item);
            this.allAwsersIsInEvaluation(section, item);
          }
        });
      });
    }
    this._router.navigate(['entry', this.pia.id, 'section', this._paginationService.nextLink[0], 'item',
                           this._paginationService.nextLink[1]]);
    this._modalsService.openModal('ask-for-evaluation');
  }

  /**
   * Allow an user to cancel an evaluation for a section
   * @memberof EvaluationService
   */
  async cancelForEvaluation(piaService: any, sidStatusService: any, section: any, item: any) {
    // Creates evaluations according to evaluation_mode
    if (this.item.evaluation_mode === 'item') {
      this.deleteEvaluationInDb(section.id + '.' + item.id).then(() => {
        sidStatusService.removeSidStatus(piaService, section, item);
        this.allAwsersIsInEvaluation(section, item);
      });
    } else {
      let count = 0;
      const countAnswers = this.answers.length;
      this.answers.forEach((answer) => {
        return new Promise((resolve, reject) => {
          let reference_to = null;
          reference_to = section.id + '.' + item.id + '.' + answer.reference_to;
          if (item.is_measure) {
            reference_to = section.id + '.' + item.id + '.' + answer;
          }
          this.deleteEvaluationInDb(reference_to).then(() => {
            count += 1;
            resolve();
          });
        }).then(() => {
          if (count ===  countAnswers) {
            sidStatusService.removeSidStatus(piaService, section, item);
            this.allAwsersIsInEvaluation(section, item);
          }
        });
      });
    }
  }

  allAwsersIsInEvaluation(section: any, item: any) {
    this.showValidationButton = false;
    let reference_to = '';
    if (item.evaluation_mode === 'item') {
      reference_to = section.id + '.' + item.id;
      const evaluation = new Evaluation();
      evaluation.getByReference(this.pia.id, reference_to).then((entry: any) => {
        if (entry !== false) {
          if (entry.status === 1) {
            this.showValidationButton = false;
          } else {
            this.showValidationButton = true;
          }
        } else {
          this.showValidationButton = false;
        }
      });
    } else if (this.answers.length > 0) {
      let count = 0;
      this.answers.forEach((answer) => {
        if (item.is_measure) {
          // For measure
          reference_to = section.id + '.' + item.id + '.' + answer;
        } else {
          // For question
          reference_to = section.id + '.' + item.id + '.' + answer.reference_to;
        }
        const evaluation = new Evaluation();
        evaluation.getByReference(this.pia.id, reference_to).then((entry: any) => {
          if (entry !== false) {
            if (entry.status !== 1) {
              count += 1;
            }
            this.showValidationButton = (count === this.answers.length);
          }
        });
      });
    }
  }

  dpoAnswerOk() {
    return (this.pia.dpos_names && this.pia.dpo_opinion && this.pia.dpos_names.length > 0
            && this.pia.dpo_opinion.length > 0 && this.pia.dpo_status >= 0);
  }

  remove(reference_to: any) {
    const evaluation = new Evaluation();
    if (this.item.is_measure) {
      reference_to = this.section.id + '.' + this.item.id + '.' + reference_to;
    } else if (this.item.evaluation_mode === 'item') {
      reference_to = this.section.id + '.' + this.item.id;
    }
    evaluation.getByReference(this.pia.id, reference_to).then(() => {
      if (evaluation.id) {
        evaluation.delete(evaluation.id);
      }
    });
  }

  async validateAllEvaluation() {
    return new Promise((resolve, reject) => {
      let reference_to = '';
      if (this.item.evaluation_mode === 'item') {
        reference_to = this.section.id + '.' + this.item.id;
        const evaluation = new Evaluation();
        evaluation.getByReference(this.pia.id, reference_to).then(() => {
          if (evaluation.status > 1) {
            evaluation.global_status = 1;
            evaluation.update().then(() => {
              this.showValidationButton = false;
              this.enableFinalValidation = true;
              resolve(true);
            });
          } else {
            resolve(false);
          }
        });
      } else if (this.answers.length > 0) {
        let count = 0;
        this.answers.forEach((answer) => {
          if (this.item.is_measure) {
            // For measure
            reference_to = this.section.id + '.' + this.item.id + '.' + answer;
          } else {
            // For question
            reference_to = this.section.id + '.' + this.item.id + '.' + answer.reference_to;
          }
          const evaluation = new Evaluation();
          evaluation.getByReference(this.pia.id, reference_to).then(() => {
            if (evaluation.status > 1) {
              evaluation.global_status = 1;
              evaluation.update().then(() => {
                count += 1;
                if (count === this.answers.length) {
                  this.showValidationButton = false;
                  this.enableFinalValidation = true;
                  resolve(true);
                }
              });
            } else {
              resolve(false);
            }
          });
        });
      }
    });
  }

  async cancelValidation() {
    return new Promise((resolve, reject) => {
      let reference_to = '';
      if (this.item.evaluation_mode === 'item') {
        reference_to = this.section.id + '.' + this.item.id;
        const evaluation = new Evaluation();
        evaluation.getByReference(this.pia.id, reference_to).then(() => {
          evaluation.global_status = 0;
          evaluation.update().then(() => {
            this.showValidationButton = true;
            this.enableFinalValidation = false;
            resolve(true);
          });
        });
      } else if (this.answers.length > 0) {
        let count = 0;
        this.answers.forEach((answer) => {
          if (this.item.is_measure) {
            // For measure
            reference_to = this.section.id + '.' + this.item.id + '.' + answer;
          } else {
            // For question
            reference_to = this.section.id + '.' + this.item.id + '.' + answer.reference_to;
          }
          const evaluation = new Evaluation();
          evaluation.getByReference(this.pia.id, reference_to).then(() => {
            evaluation.global_status = 0;
            evaluation.update().then(() => {
              count += 1;
              if (count === this.answers.length) {
                this.showValidationButton = true;
                this.enableFinalValidation = false;
                resolve(true);
              }
            });
          });
        });
      }
    });
  }

  isAllEvaluationValidated() {
    this.isAllEvaluationValidated2(this.section.id, this.item);
  }

  isAllEvaluationValidated2(section_id: number, item: any) {
    let reference_to = '';
    if (item.evaluation_mode === 'item') {
      reference_to = section_id + '.' + item.id;
      const evaluation = new Evaluation();
      evaluation.getByReference(this.pia.id, reference_to).then(() => {
        if (evaluation.global_status === 1) {
          this.showValidationButton = false;
          this.enableFinalValidation = true;
        }
      });
    } else if (this.answers.length > 0) {
      let count = 0;
      this.answers.forEach((answer) => {
        if (item.is_measure) {
          // For measure
          reference_to = section_id + '.' + item.id + '.' + answer;
        } else {
          // For question
          reference_to = section_id + '.' + item.id + '.' + answer.reference_to;
        }
        const evaluation = new Evaluation();
        evaluation.globalStatusByReference(this.pia.id, reference_to).then((exist: boolean) => {
          if (exist) {
            count += 1;
            if (count === this.answers.length) {
              this.showValidationButton = false;
              this.enableFinalValidation = true;
            }
          }
        });
      });
    }
  }

  async isItemIsValidated(section_id: number, item: any) {
    return new Promise((resolve, reject) => {
      let reference_to = '';
      if (item.evaluation_mode === 'item') {
        reference_to = section_id + '.' + item.id;
        const evaluation = new Evaluation();
        evaluation.getByReference(this.pia.id, reference_to).then(() => {
          if (evaluation.global_status === 1) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        let count = 0;
        let countGlobal = 0;
        this.setAnswers(item, false).then((answers: any) => {
          if (answers.length > 0) {
            answers.forEach((answer) => {
              const evaluation = new Evaluation();
              if (item.is_measure) {
                // For measure
                reference_to = section_id + '.' + item.id + '.' + answer;
              } else {
                // For question
                reference_to = section_id + '.' + item.id + '.' + answer.reference_to;
              }
              evaluation.globalStatusByReference(this.pia.id, reference_to).then((exist: boolean) => {
                countGlobal++;
                if (exist) {
                  count++;
                  if (count === answers.length) {
                    resolve(true);
                  }
                }
                if (countGlobal === answers.length) {
                  resolve(false);
                }
              });
            });
          } else {
            resolve(false);
          }
        });
      }
    });
  }

  private async createEvaluationInDb(reference_to: string) {
    const evaluation = new Evaluation();
    return new Promise((resolve, reject) => {
      evaluation.getByReference(this.pia.id, reference_to).then((entry: any) => {
        if (entry === false) {
          evaluation.pia_id = this.pia.id;
          evaluation.reference_to = reference_to;
          evaluation.create().then(() => {
            resolve();
          });
        } else if (evaluation.status === 0 || evaluation.status === 1) {
          evaluation.status = 0;
          evaluation.update().then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
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

}

