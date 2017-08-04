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
  enable = false;
  toValidate = false;
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
          this.enable = this.answers.length === measures.length ? true : false;
        });
      } else if (this.item.questions) {
        // For questions
        const questionsIds = [];
        this.item.questions.forEach(question => {
          questionsIds.push(question.id);
        });
        this.answer.findAllByPia(this.pia.id).then((answers: any) => {
          this.answers = answers.filter((answer) => {
            return questionsIds.indexOf(answer.reference_to) >= 0;
          });
          this.enable = this.answers.length === questionsIds.length ? true : false;
        });
      }
    }
  }

  /**
   * Allows an user to ask an evaluation for a section.
   */
  prepareForEvaluation() {
    // Creates evaluations according to evaluation_mode
    if (this.item.evaluation_mode === 'item') {
      this.createEvaluationInDb(this.section.id + '.' + this.item.id);
    } else {
      this.answers.forEach((answer) => {
        let reference_to = null;
        reference_to = answer.reference_to;
        if (this.item.is_measure) {
          reference_to = this.section.id + '.' + this.item.id + '.' + answer;
        }
        this.createEvaluationInDb(reference_to);
      });
    }
    this._modalsService.openModal('ask-for-evaluation');
    /* TODO : update PIA status + 'refresh PIA' so that it changes header status icon + navigation status icons */
  }

  validateEvaluation() {
    console.log('test');
  }

  private createEvaluationInDb(reference_to: string) {
    const evaluation = new Evaluation();
    evaluation.existByReference(this.pia.id, reference_to).then((exist: boolean) => {
      if (!exist) {
        evaluation.pia_id = this.pia.id;
        evaluation.reference_to = reference_to;
        evaluation.create();
      }
    });
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
  /*TODO : check why it sends an array with weird data in it to evaluation component.ts ... */
  async getGaugesValues() {
    const gaugesValues = [];
    return new Promise((resolve, reject) => {
      /* gaugesValues[0] is gravity (y) and gaugesValues[1] is impact (x) */

      const questions: any[] = this.item.questions.filter((question) => {
        return question.answer_type === 'gauge';
      });

      questions.forEach(question => {
        const answersModel = new Answer();
        answersModel.getByReferenceAndPia(this.pia.id, question.id).then(() => {
          if (answersModel.data) {
            console.log(answersModel.data['gauge']);
            gaugesValues.push(answersModel.data['gauge']);
          }
        });
      });

      resolve(gaugesValues);
    });
  }

}

