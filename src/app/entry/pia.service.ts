import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Http } from '@angular/http';

import { AppDataService } from 'app/services/app-data.service';
import { ModalsService } from 'app/modals/modals.service';
import { ActionPlanService } from 'app/entry/entry-content/action-plan//action-plan.service';

//new imports

import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
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
    this._appDataService.getDataNav().then((dataNav) => {
      this.data = dataNav;
    });
  }

  /**
   * Get the current PIA.
   * @return { Observable<PiaModel> }
  * @memberof PiaService
  */
  retrieveCurrentPIA(id: number): Observable<PiaModel> {

    return this.piaApi.get(id).map((thePia: PiaModel) => {
      this.pia.fromJson(thePia);
      return this.pia;
    });

  }

  /**
   * Get the PIA.
   * @return {Promise}
   * @memberof PiaService
   * @deprecated
   */
  getPIA() {
    console.warn('getPIA is deprecated');
    return new Promise((resolve, reject) => { resolve(this.pia) });
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
  async cancelAllValidatedEvaluation(): Promise<void> {

    const results = [];
    let entries: EvaluationModel[] = await this.evaluationApi.getAll(this.pia.id).toPromise();
    entries.forEach(element => {
      element.global_status = 0;
      results.push(this.evaluationApi.update(element).toPromise());
    });
    await Promise.all(results);

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
  exportData(id: number): Promise<any> {

    return new Promise((resolve, reject) => {

      this.piaApi.get(id).subscribe((pia: PiaModel) => {
        const data = {
          pia: pia,
          answers: null,
          measures: null,
          evaluations: null,
          comments: null,
          attachments: null
        }
        Observable
          .forkJoin(
            this.answerApi.getAll(id),
            this.measureApi.getAll(id),
            this.evaluationApi.getAll(id),
            this.commentApi.getAll(id),
            this.attachmentApi.getAll(id),
        )
          .subscribe((values) => {
            data.answers = values[0];
            data.measures = values[1];
            data.evaluations = values[2];
            data.comments = values[3];
            data.attachments = values[4];
            resolve(data);
          });
      });
    });
  }

  /**
   * Allows a user to import a PIA.
   * @param {*} data - Data PIA.
   * @param {string} prefix - A title prefix.
   * @param {boolean} is_duplicate - Is a duplicate PIA?
   * @param {boolean} [is_example] - Is the PIA example?
   * @memberof PiaService
   */
  async importData(data: any, prefix: string, is_duplicate: boolean, is_example?: boolean): Promise<void> {
    if (!('pia' in data)) {
      return;
    }
    let pia = new PiaModel();
    const values = data.pia;
    values.id = null;
    values.name = '(' + prefix + ') ' + values.name;
    pia.fromJson(values);

    /* Set this PIA as the example PIA if needed, else default value affected on creation */
    if (is_example) {
      pia.is_example = true;
    }

    if (is_duplicate) {
      pia.status = 0;
      pia.created_at = null;
      pia.updated_at = null;
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
    }
    const newPia: PiaModel = await this.piaApi.create(pia).toPromise();
    pia.fromJson(newPia);
    // Create answers
    data.answers.forEach(answer => {
      answer.id = null;
      const answerModel = new AnswerModel();
      answerModel.fromJson(answer);
      answerModel.pia_id = pia.id;
      this.answerApi.create(answerModel).subscribe();
    });

    if (data.measures.length > 0) {
      let count = 0;
      const asyncResults = [];
      const oldIdToNewId = [];
      // Create measures
      data.measures.forEach(measure => {
        measure.id = null;
        const measureModel = new MeasureModel();
        measureModel.fromJson(measure);
        measureModel.pia_id = newPia.id;
        let p = this.measureApi.create(measureModel).toPromise();
        p.then((newMeasure: MeasureModel) => { oldIdToNewId[measure.id] = newMeasure.id; });
        asyncResults.push(p);
      });
      await Promise.all(asyncResults);
      this.importEvaluations(data, pia.id, is_duplicate, oldIdToNewId);
    } else {
      this.importEvaluations(data, pia.id, is_duplicate);
    }

    if (!is_duplicate) {
      // Create comments
      data.comments.forEach(comment => {
        comment.id = null;
        const commentModel = new CommentModel();
        commentModel.fromJson(comment);
        commentModel.pia_id = pia.id;
        this.commentApi.create(commentModel).subscribe();
      });
    }

    // Create attachments
    data.attachments.forEach(attachment => {
      attachment.id = null;
      const attachmentModel = new AttachmentModel();
      attachmentModel.fromJson(attachment);
      attachmentModel.pia_id = pia.id;
      this.attachmentApi.create(attachmentModel).subscribe();
    });

    await this.piaApi.computeProgress(pia).toPromise();
    this.pias.push(pia);
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
        evaluation.id = null;
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

    return new Promise((resolve, reject) => {
      reader.onload = async (event: any) => {
        const jsonFile = JSON.parse(event.target.result);
        await this.importData(jsonFile, 'IMPORT', false);
        resolve();
      }
    });
  }

  public saveCurrentPia(): Observable<PiaModel> {
    return this.piaApi.update(this.pia).map((updatedPia: PiaModel) => {
      this.pia = updatedPia;
      return this.pia;
    });
  }

  /**
   * Get people status.
   * @param {boolean} status - The people search status.
   * @returns {string} - Locale for translation.
   * @memberof Pia
   */
  public getPeopleSearchStatus(status: boolean) {
    if (status === true) {
      return 'summary.people_search_status_ok';
    } else {
      return 'summary.people_search_status_nok';
    }
  }

  /**
   * Get opinion status.
   * @param {string} status - The opinion status.
   * @returns {string} - Locale for translation.
   * @memberof Pia
   */
  public getOpinionsStatus(status: string) {
    if (status) {
      return `summary.content_choice.${status}`;
    }
  }

  /**
   * Get gauge name.
   * @param {*} value - The gauge value.
   * @returns {string} - Locale for translation.
   * @memberof Pia
   */
  public getGaugeLabel(value: any) {
    if (value) {
      return `summary.gauges.${value}`;
    }
  }
}
