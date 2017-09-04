import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Http } from '@angular/http';

import { Pia } from './pia.model';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';

import { ModalsService } from 'app/modals/modals.service';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';
import { ActionPlanService } from 'app/entry/entry-content/action-plan//action-plan.service';

@Injectable()
export class PiaService {

  pias: any[];
  pia: Pia = new Pia();
  answer: Answer = new Answer();
  data: { sections: any };
  sidStatus = {};

  constructor(private _router: Router, private route: ActivatedRoute,
              private _evaluationService: EvaluationService,
              private _modalsService: ModalsService, private http: Http) {
                this.http.request('/assets/files/pia_architecture.json').map(res => res.json()).subscribe(data => {
                  this.data = data;
                });
              }

  /**
   * Gets the PIA.
   * @return the PIA object.
   */
  async getPIA() {
    return new Promise((resolve, reject) => {
      const piaId = parseInt(this.route.snapshot.params['id'], 10);
      this.pia.get(piaId).then((entry) => {
        this._evaluationService.setPia(this.pia);
        resolve();
      });
    });
  }

  /**
   * Allows an user to remove a PIA.
   */
  removePIA() {
    const piaID = parseInt(localStorage.getItem('pia-id'), 10);

    // Removes from DB.
    const pia = new Pia();
    pia.delete(piaID);

    /* TODO : refactor this... */
    // Deletes the PIA from the view.
    if (localStorage.getItem('homepageDisplayMode') && localStorage.getItem('homepageDisplayMode') === 'list') {
      document.querySelector('.app-list-item[data-id="' + piaID + '"]').remove();
    } else {
      document.querySelector('.pia-cardsBlock.pia-doingBlock[data-id="' + piaID + '"]').remove();
    }

    localStorage.removeItem('pia-id');
    this._modalsService.closeModal();
  }

  async piaInGlobalValidation() {
    return new Promise((resolve, reject) => {
      // TODO - Count all evaluation_mode
      let countEvaluationMode = 17;
      const measure = new Measure();
      measure.pia_id = this._evaluationService.pia.id;
      const dpoAnswerOk = this._evaluationService.dpoAnswerOk();
      measure.findAll().then((entries: any) => {
        if (entries) {
          countEvaluationMode += entries.length;
        }
        // Count all valid evaluation in DB with global_status === 1
        const evaluation = new Evaluation();
        evaluation.pia_id = this._evaluationService.pia.id;
        evaluation.findAll().then((entries2: any) => {
          const entriesWithGlobalStatus = entries2.filter((e) => {
            return e.global_status === 1;
          });
          resolve((countEvaluationMode === entriesWithGlobalStatus.length) && dpoAnswerOk);
        });
      });
    });
  }

  async setSidStatus() {
    const answer = new Answer();
    const measure = new Measure();
    this.sidStatus = {};
    measure.pia_id = this.pia.id;
    // Check if there is at least one answer
    answer.findAllByPia(this.pia.id).then((entries: any) => {
      if (entries) {
        entries.forEach(element => {
          const ref = element.reference_to.toString().substr(0, 2);
          if (!this.sidStatus[ref]) {
            this.sidStatus[ref] = 1;
          }
        });
      }
      // Check if there is at least one measure
      measure.findAll().then((measures: any) => {
        if (measures && measures.length > 0) {
          this.sidStatus['31'] = 1;
        }
        this.data.sections.forEach(section => {
          section.items.forEach(item => {
            this._evaluationService.isItemIsValidated(section.id, item).then((result: boolean) => {
              const ref = section.id.toString() + item.id.toString();
              if (result && this.sidStatus[ref]) {
                this.sidStatus[ref] = 2;
              }
            })
          });
        });
      });
    });
  }

  async cancelAllValidatedEvaluation() {
    return new Promise((resolve, reject) => {
      let evaluation = new Evaluation();
      evaluation.pia_id = this._evaluationService.pia.id;
      evaluation.findAll().then((entries: any) => {
        entries.forEach(element => {
          evaluation = new Evaluation();
          evaluation.get(element.id).then((entry: any) => {
            /* TODO : entry.status = 0; */
            entry.global_status = 0;
            entry.update();
          });
        });
        resolve();
      });
    });
  }

  /**
   * Allows an user to abandon a treatment (archive a PIA)
   */
  abandonTreatment() {
    this.pia.status = 4;
    this.pia.update().then(() => {
      this._modalsService.closeModal();
      this._router.navigate(['home']);
    });
  }
}
