import { Injectable } from '@angular/core';
import { ModalsService } from 'app/modals/modals.service';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Pia } from 'app/entry/pia.model';

@Injectable()
export class EvaluationService {

  section: any;
  item: any;
  enableEvaluation = false;
  enableValidation = false;
  showValidationButton = false;
  enableFinalValidation = false;
  answers: any[] = [];
  answer: Answer = new Answer();
  measure: Measure = new Measure();
  private pia: Pia;

  constructor(private _modalsService: ModalsService) { }

  setPia(pia: Pia) {
    this.pia = pia;
    this.measure.pia_id = pia.id;
  }

  allowEvaluation() {
    this.enableEvaluation = false;
    this.enableValidation = false;
    this.showValidationButton = false;
    this.enableFinalValidation = false;
    this.answers = [];
    if (this.item) {
      if (this.item.is_measure) {
        // For measures
        this.measure.findAll().then((measures: any[]) => {
          measures.forEach(measure => {
            if (measure.title && measure.title.length > 0 && measure.content && measure.content.length > 0) {
              this.answers.push(measure.id);
            }
          });
          this.enableEvaluation = this.answers.length === measures.length ? true : false;
          this.allAwsersIsInEvaluation();
        });
      } else if (this.item.questions) {
        // For questions and item evaluation_mode
        const questionsIds = [];
        this.item.questions.forEach(question => {
          questionsIds.push(question.id);
        });
        this.answer.findAllByPia(this.pia.id).then((answers: any) => {
          this.answers = answers.filter((answer) => {
            return questionsIds.indexOf(answer.reference_to) >= 0;
          });
          this.enableEvaluation = this.answers.length === questionsIds.length ? true : false;
          this.allAwsersIsInEvaluation();
        });
      }
    }
  }

  /**
   * Allows an user to ask an evaluation for a section.
   */
  async prepareForEvaluation() {
    // Creates evaluations according to evaluation_mode
    if (this.item.evaluation_mode === 'item') {
      this.createEvaluationInDb(this.section.id + '.' + this.item.id).then(() => {
        this.allAwsersIsInEvaluation();
      });
    } else {
      let count = 0;
      this.answers.forEach((answer) => {
        return new Promise((resolve, reject) => {
          let reference_to = null;
          reference_to = this.section.id + '.' + this.item.id + '.' + answer.reference_to;
          if (this.item.is_measure) {
            reference_to = this.section.id + '.' + this.item.id + '.' + answer;
          }
          this.createEvaluationInDb(reference_to).then(() => {
            count += 1;
            resolve();
          });
        }).then(() => {
          if (count ===  this.answers.length) {
            this.allAwsersIsInEvaluation();
          }
        });
      });
    }
    this._modalsService.openModal('ask-for-evaluation');
    /* TODO : update PIA status + 'refresh PIA' so that it changes header status icon + navigation status icons */
  }

  allAwsersIsInEvaluation() {
    const evaluation = new Evaluation();
    let reference_to = '';
    if (this.item.evaluation_mode === 'item') {
      reference_to = this.section.id + '.' + this.item.id;
      evaluation.existByReference(this.pia.id, reference_to).then((exist: boolean) => {
        this.showValidationButton = exist;
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
        evaluation.existByReference(this.pia.id, reference_to).then((exist: boolean) => {
          if (exist) {
            count += 1;
            this.showValidationButton = (count === this.answers.length);
          }
        });
      });
    }
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

  checkForFinalValidation() {
    this.enableValidation = true;
  }

  validateAllEvaluation() {
    const evaluation = new Evaluation();
    let reference_to = '';
    if (this.item.evaluation_mode === 'item') {
      reference_to = this.section.id + '.' + this.item.id;
      evaluation.getByReference(this.pia.id, reference_to).then(() => {
        evaluation.global_status = 1;
        evaluation.update().then(() => {
          this.showValidationButton = false;
          this.enableFinalValidation = true;
        });
      });
    } else if (this.answers.length > 0) {
      this.answers.forEach((answer) => {
        if (this.item.is_measure) {
          // For measure
          reference_to = this.section.id + '.' + this.item.id + '.' + answer;
        } else {
          // For question
          reference_to = this.section.id + '.' + this.item.id + '.' + answer.reference_to;
        }
        evaluation.getByReference(this.pia.id, reference_to).then(() => {
          evaluation.global_status = 1;
          evaluation.update();
          this.showValidationButton = false;
          this.enableFinalValidation = true;
        });
      });
    }
  }

  isAllEvaluationValidated() {
    const evaluation = new Evaluation();
    let reference_to = '';
    if (this.item.evaluation_mode === 'item') {
      reference_to = this.section.id + '.' + this.item.id;
      evaluation.getByReference(this.pia.id, reference_to).then(() => {
        if (evaluation.global_status === 1) {
          this.showValidationButton = false;
          this.enableFinalValidation = true;
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
        evaluation.getByReference(this.pia.id, reference_to).then(() => {
          if (evaluation.global_status === 1) {
            count += 1;
          }
          if (count === this.answers.length) {
            this.showValidationButton = false;
            this.enableFinalValidation = true;
          }
        });
      });
    }
  }

  private async createEvaluationInDb(reference_to: string) {
    const evaluation = new Evaluation();
    return new Promise((resolve, reject) => {
      evaluation.existByReference(this.pia.id, reference_to).then((exist: boolean) => {
        if (!exist) {
          evaluation.pia_id = this.pia.id;
          evaluation.reference_to = reference_to;
          evaluation.create().then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

}

