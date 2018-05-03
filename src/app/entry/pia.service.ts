import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Http } from '@angular/http';

import { AppDataService } from 'app/services/app-data.service';
import { ModalsService } from 'app/modals/modals.service';
import { ActionPlanService } from 'app/entry/entry-content/action-plan//action-plan.service';

//new imports

import { Observable } from 'rxjs/Rx';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { PiaModel, AnswerModel, CommentModel, EvaluationModel, MeasureModel, AttachmentModel } from '@api/models';
import { PiaApi, AnswerApi, CommentApi, EvaluationApi, MeasureApi, AttachmentApi } from '@api/services';

@Injectable()
export class PiaService {

  pias = [];
  pia: PiaModel = new PiaModel();
  answer: AnswerModel = new AnswerModel();
  data: { sections: any };

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private _appDataService: AppDataService,
    private _modalsService: ModalsService,
    private http: Http,
    private piaApi: PiaApi,
    private answerApi: AnswerApi,
    private commentApi: CommentApi,
    private evaluationApi: EvaluationApi,
    private measureApi: MeasureApi,
    private attachmentApi: AttachmentApi
  ) {
    this.getPIA(); //temp hack
    this._appDataService.getDataNav().then((dataNav) => {
      this.data = dataNav;
    });
  }

  /**
   * Get the PIA.
   * @return {Promise}
   * @memberof PiaService
   */
  getPIA() {

    return new Promise((resolve, reject) => {
      const piaId = parseInt(this.route.snapshot.params['id'], 10);
      if (!piaId) {
        return;
      }
      this.piaApi.get(piaId).subscribe((thePia: PiaModel) => {
        this.pia.fromJson(thePia);
        resolve(this.pia);
      });
    });
  }

  /**
   * Allows an user to remove a PIA.
   * @memberof PiaService
   */
  removePIA() {
    const piaID = parseInt(localStorage.getItem('pia-id'), 10);

    // Removes from DB.
    this.piaApi.deleteById(piaID).subscribe();

    // Deletes the PIA from the view.
    if (localStorage.getItem('homepageDisplayMode') && localStorage.getItem('homepageDisplayMode') === 'list') {
      document.querySelector('.app-list-item[data-id="' + piaID + '"]').remove();
    } else {
      document.querySelector('.pia-cardsBlock.pia[data-id="' + piaID + '"]').remove();
    }

    localStorage.removeItem('pia-id');
    this._modalsService.closeModal();
  }

  /**
   * Cancel all validated evaluations.
   * @returns {Promise}
   * @memberof PiaService
   */
  async cancelAllValidatedEvaluation() {
    return new Promise((resolve, reject) => {
      let count = 0;

      this.evaluationApi.getAll(this.pia.id).subscribe((entries: any) => {
        if (entries && entries.length > 0) {
          entries.forEach(element => {
            element.global_status = 0;
            this.evaluationApi.update(element)
              .subscribe(() => {
                count++;
                if (count === entries.length) {
                  resolve();
                }
              });
          });
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Allows an user to abandon a treatment (archive a PIA).
   * @memberof PiaService
   */
  abandonTreatment() {
    this.pia.status = 4;
    this.piaApi.update(this.pia).subscribe((updatedPia: PiaModel) => {
      this.pia.fromJson(updatedPia);
      this._modalsService.closeModal();
      this._router.navigate(['home']);
    });
  }

  /**
   * Allow an user to duplicate a PIA.
   * @param {number} id - The PIA id.
   * @memberof PiaService
   */
  duplicate(id: number) {
    this.exportData(id).then((data) => {
      this.importData(data, 'COPY', true);
    });
  }

  /**
   * Allow an user to export a PIA.
   * @param {number} id - The PIA id.
   * @returns {Promise}
   * @memberof PiaService
   */
  exportData(id: number) {

    return new Promise((resolve, reject) => {

      this.piaApi.get(id).subscribe((pia: PiaModel) => {
        const data = {
          pia: pia,
          answers: null,
          measures: null,
          evaluations: null,
          comments: null
        }
        Observable
          .forkJoin(
          this.answerApi.getAll(id),
          this.measureApi.getAll(id),
          this.evaluationApi.getAll(id),
          this.commentApi.getAll(id),
          //this.attachmentApi.getAll(id),
        )
          .subscribe((values) => {
            data.answers = values[0];
            data.measures = values[1];
            data.evaluations = values[2];
            data.comments = values[3];
            //data.attachments = values[4];
            resolve(data);
          });
      });
    });
  }

  /**
   * Allow an user to import a PIA.
   * @param {*} data - Data PIA.
   * @param {string} prefix - A title prefix.
   * @param {boolean} is_duplicate - Is a duplicate PIA?
   * @param {boolean} [is_example] - Is the PIA example?
   * @memberof PiaService
   */
  async importData(data: any, prefix: string, is_duplicate: boolean, is_example?: boolean) {
    if (!('pia' in data) || !('dbVersion' in data.pia)) {
      return;
    }
    let pia = new PiaModel();
    const values = data.pia;
    values.name = '(' + prefix + ') ' + values.name;
    pia.fromJson(values);

    /* Set this PIA as the example PIA if needed, else default value affected on creation */
    if (is_example) {
      pia.is_example = true;
    }

    if (is_duplicate) {
      pia.status = 0;
      pia.created_at = new Date();
      pia.updated_at = new Date();
      pia.dpos_names = null;
      pia.dpo_status = null;
      pia.dpo_opinion = null;
      pia.concerned_people_searched_opinion = null;
      pia.concerned_people_searched_content = null;
      pia.people_names = null;
      pia.concerned_people_status = null;
      pia.concerned_people_opinion = null;
    } else {
      pia.status = parseInt(data.pia.status, 10);
      if (Number.isNaN(pia.status)) {
        pia.status = 0;
      }
      pia.created_at = new Date(data.pia.created_at);
      if (data.pia.updated_at) {
        pia.updated_at = new Date(data.pia.updated_at);
      }
    }
    this.piaApi.create(pia).subscribe((newPia: PiaModel) => {
      pia = newPia;
      // Create answers
      data.answers.forEach(answer => {
        const answerModel = new AnswerModel();
        answerModel.pia_id = pia.id;
        answerModel.reference_to = answer.reference_to;
        answerModel.data = answer.data;
        answerModel.created_at = new Date(answer.created_at);
        if (answer.updated_at) {
          answerModel.updated_at = new Date(answer.updated_at);
        }
        this.answerApi.create(answerModel).subscribe();
      });

      if (data.measures.length > 0) {
        let count = 0;
        const oldIdToNewId = [];
        // Create measures
        data.measures.forEach(measure => {
          const measureModel = new MeasureModel();
          measureModel.title = measure.title;
          measureModel.pia_id = newPia.id;
          measureModel.content = measure.content;
          measureModel.placeholder = measure.placeholder;
          measureModel.created_at = new Date(measure.created_at);
          if (measure.updated_at) {
            measureModel.updated_at = new Date(measure.updated_at);
          }
          this.measureApi.create(measureModel).subscribe((newMeasure: MeasureModel) => {
            count++;
            oldIdToNewId[measure.id] = newMeasure.id;
            if (count === data.measures.length) {
              this.importEvaluations(data, pia.id, is_duplicate, oldIdToNewId);
            }
          });
        });
      } else {
        this.importEvaluations(data, pia.id, is_duplicate);
      }

      if (!is_duplicate) {
        // Create comments
        data.comments.forEach(comment => {
          const commentModel = new CommentModel();
          commentModel.pia_id = pia.id;
          commentModel.description = comment.description;
          commentModel.reference_to = comment.reference_to;
          commentModel.for_measure = comment.for_measure;
          commentModel.created_at = new Date(comment.created_at);
          if (comment.updated_at) {
            commentModel.updated_at = new Date(comment.updated_at);
          }
          this.commentApi.create(commentModel).subscribe();
        });
      }
      this.piaApi.computeProgress(pia)
        .subscribe(() => this.pias.push(pia));
    });
  }

  /**
   * Import all evaluations.
   * @private
   * @param {*} data - Data PIA.
   * @param {number} pia_id - The PIA id.
   * @param {boolean} is_duplicate - Is a duplicated PIA?
   * @param {Array<any>} [oldIdToNewId] - Array to generate new id for special item.
   * @memberof PiaService
   */
  private importEvaluations(data: any, pia_id: number, is_duplicate: boolean, oldIdToNewId?: Array<any>) {
    if (!is_duplicate) {
      // Create evaluations
      data.evaluations.forEach(evaluation => {

        const evaluationModel = new EvaluationModel();
        evaluationModel.fromJson(evaluation);
        evaluationModel.pia_id = pia_id;

        let reference_to = evaluation.reference_to;

        if (reference_to.startsWith('3.1') && oldIdToNewId) {
          const ref = reference_to.split('.')
          if (oldIdToNewId[ref[2]]) {
            reference_to = '3.1.' + oldIdToNewId[ref[2]];
          }
        }
        evaluationModel.reference_to = reference_to;

        if (evaluation.evaluation_date) {
          evaluationModel.evaluation_date = new Date(evaluation.evaluation_date);
        }

        if (evaluation.estimated_implementation_date) {
          evaluationModel.estimated_implementation_date = new Date(evaluation.estimated_implementation_date);
        }

        evaluationModel.created_at = new Date(evaluation.created_at);
        if (evaluation.updated_at) {
          evaluationModel.updated_at = new Date(evaluation.updated_at);
        }
        this.evaluationApi.create(evaluationModel).subscribe();

      });
    }
  }

  /**
   * Download the PIA exported.
   * @param {number} id - The PIA id.
   * @memberof PiaService
   */
  export(id: number) {
    const date = new Date().getTime();
    this.exportData(id).then((data) => {
      const a = document.getElementById('pia-exportBlock');
      const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      a.setAttribute('href', url);
      a.setAttribute('download', date + '_export_pia_' + id + '.json');
      const event = new MouseEvent('click', {
        view: window
      });
      a.dispatchEvent(event);
    });
  }

  /**
   * Import the PIA from file.
   * @param {*} file - The exported PIA file.
   * @memberof PiaService
   */
  async import(file: any) {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (event: any) => {
      const jsonFile = JSON.parse(event.target.result);
      this.importData(jsonFile, 'IMPORT', false);
    }
  }

  public saveCurrentPia(): Observable<PiaModel> {
    return this.piaApi.update(this.pia).map((updatedPia: PiaModel) => {
      this.pia = updatedPia;
      return this.pia;
    });
  }
}
