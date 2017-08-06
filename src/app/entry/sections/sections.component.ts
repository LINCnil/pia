import { Component, OnInit, Input, Output } from '@angular/core';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { PiaService } from 'app/entry/pia.service';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
  providers: [PiaService]
})
export class SectionsComponent implements OnInit {

  @Input() section: { id: number, title: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  @Input() data: any;

  constructor(private _piaService: PiaService) {
  }

  ngOnInit() {
    this._piaService.getPIA();
  }

  /**
   * Shows the validation button with a disabled state.
   * @return true if the PIA is ongoing, false otherwise.
   */
  lockedValidationButton() {
    return this._piaService.pia.status === 0;
  }

  /**
   * Shows the validation button in the navigation.
   * @return true if the PIA is validated, false otherwise.
   */
  showValidationButton() {
    return (this._piaService.pia.status === 2 || this._piaService.pia.status === 3);
  }

  /**
   * Shows the refuse button in the navigation.
   * @return true if the PIA is refused, false otherwise.
   */
  showRefuseButton() {
    if (((this._piaService.pia.status === 2 || this._piaService.pia.status === 3) &&
            this._piaService.pia.rejected_reason) || this._piaService.pia.status === 1 ) {
      return true;
    } else {
      return false;
    }
  }

  // enableItemFinalValidation(item: any) {
  //   return true;
  // }

  // showItemValidationButton(item: any) {
  //   const evaluation = new Evaluation();
  //   let reference_to = '';
  //   if (item.evaluation_mode === 'item') {
  //     reference_to = this.section.id + '.' + item.id;
  //     evaluation.existByReference(this._piaService.pia.id, reference_to).then((exist: boolean) => {
  //       return exist;
  //     });
  //   } else {
  //     let count = 0;
  //     this.getAllAnswers(item).then((answers: any) => {
  //       answers.forEach((answer) => {
  //         if (item.is_measure) {
  //           // For measure
  //           reference_to = this.section.id + '.' + item.id + '.' + answer;
  //         } else {
  //           // For question
  //           reference_to = this.section.id + '.' + item.id + '.' + answer.reference_to;
  //         }
  //         evaluation.existByReference(this._piaService.pia.id, reference_to).then((exist: boolean) => {
  //           if (exist) {
  //             count += 1;
  //             if (count === answers.length) {
  //               return true;
  //             }
  //           }
  //         });
  //       });
  //     });
  //   }
  // }

  // private async getAllAnswers(item: any) {
  //   const answerModel = new Answer();
  //   const measureModel = new Measure();
  //   return new Promise((resolve, reject) => {
  //     let answers = [];
  //     if (item.is_measure) {
  //       // For measures
  //       measureModel.findAll().then((measures: any[]) => {
  //         measures.forEach(measure => {
  //           if (measure.title && measure.title.length > 0 && measure.content && measure.content.length > 0) {
  //             answers.push(measure.id);
  //           }
  //         });
  //         resolve(answers);
  //       });
  //     } else if (item.questions) {
  //       // For questions and item evaluation_mode
  //       const questionsIds = [];
  //       this.item.questions.forEach(question => {
  //         questionsIds.push(question.id);
  //       });
  //       answerModel.findAllByPia(this._piaService.pia.id).then((a: any) => {
  //         answers = a.filter((answer) => {
  //           return questionsIds.indexOf(answer.reference_to) >= 0;
  //         });
  //         resolve(answers);
  //       });
  //     }
  //   });
  // }
}
