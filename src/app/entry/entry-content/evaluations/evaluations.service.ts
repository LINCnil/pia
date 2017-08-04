import { Injectable } from '@angular/core';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
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
    // if (this.item.evaluation_mode === 'item') {
    //   const evaluation = new Evaluation();
    //   evaluation.pia_id = this._piaService.pia.id;
    //   evaluation.reference_to = this.section.id + '.' + this.item.id;
    //   evaluation.create();
    // } else {
    //   // Measures evaluations creation (n measures = n answers = n evaluations)
    //   if (this.section.id === 3 && this.item.id === 1) {
    //     for (let i = 0; i < this._measureService.measures.length; i++) {
    //       const evaluation = new Evaluation();
    //       evaluation.pia_id = this._piaService.pia.id;
    //       evaluation.reference_to = this.section.id + '.' + this.item.id + '.' + this._measureService.measures[i].id;
    //       evaluation.create();
    //     }
    //   } else {
    //     // Questions evaluations creation (n questions = n questions answers = n evaluations)
    //     for (let i = 0; i < this.questions.length; i++) {
    //       const evaluation = new Evaluation();
    //       evaluation.pia_id = this._piaService.pia.id;
    //       evaluation.reference_to = this.answers[i].reference_to;
    //       evaluation.create();
    //     }
    //   }
    // }

    // this._modalsService.openModal('ask-for-evaluation');

    /* TODO : update PIA status + 'refresh PIA' so that it changes header status icon + navigation status icons */
  }
}
