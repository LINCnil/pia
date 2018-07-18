import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ModalsService } from '../../../modals/modals.service';
import { TranslateService } from '@ngx-translate/core';
import { KnowledgeBaseService } from '../../knowledge-base/knowledge-base.service';
import { GlobalEvaluationService } from '../../../services/global-evaluation.service';

import { MeasureModel } from '@api/models';
import { MeasureApi } from '@api/services';

@Injectable()
export class MeasureService {
  public behaviorSubject = new BehaviorSubject<string>(null);
  measures: any[];
  measureToAdd: any;
  pia_id: number;

  constructor(private _translateService: TranslateService,
    private _modalsService: ModalsService,
    private _knowledgeBaseService: KnowledgeBaseService,
    private _globalEvaluationService: GlobalEvaluationService,
    private measureApi: MeasureApi) { }

  /**
   * List the measures.
   * @param {number} pia_id - The Pia id.
   * @returns {Promise}
   * @memberof MeasureService
   */
  async listMeasures(pia_id: number) {
    this.pia_id = pia_id;
    return new Promise((resolve, reject) => {
      this.measureApi.getAll(this.pia_id).subscribe((entries: MeasureModel[]) => {
        this.measures = entries;
        resolve();
      });
    });
  }

  /**
   * Allows an user to remove a measure ("RISKS" section).
   * @memberof MeasureService
   */
  removeMeasure() {
    const measure_id = parseInt(localStorage.getItem('measure-id'), 10);

    this.measureApi.get(this.pia_id, measure_id).subscribe((newMeasure: MeasureModel) => {
      this.behaviorSubject.next(newMeasure.title);
      this._knowledgeBaseService.toHide = this._knowledgeBaseService.toHide.filter(item => item !== newMeasure.title);
    });

    /* Removing from DB */
    this.measureApi.deleteById(this.pia_id, measure_id).subscribe();

    /* Removing the measure from the view */
    const measureToRemove = document.querySelector('.pia-measureBlock[data-id="' + measure_id + '"]');
    measureToRemove.remove();

    // Deletes from the array.
    const index = this.measures.findIndex(m => m.id === measure_id);
    if (index !== -1) {
      this.measures.splice(index, 1);
    }

    localStorage.removeItem('measure-id');
    this._modalsService.closeModal();
  }

  /**
   * Adds a new measure to the PIA (used in "RISKS" section, "Mesures existantes ou prévus" subsection).
   * @param {*} pia - Any Pia.
   * @param {string} [measureTitle] - The title of the measure to be added (used in some cases).
   * @param {string} [measurePlaceholder] - The placeholder of the measure.
   * @memberof MeasureService
   */
  addNewMeasure(pia: any, measureTitle?: string, measurePlaceholder?: string) {
    const newMeasureRecord = new MeasureModel();
    newMeasureRecord.pia_id = pia.id;
    newMeasureRecord.title = '';
    if (measureTitle) {
      this._translateService.get(measureTitle).subscribe(val => this.measureToAdd = val);
      newMeasureRecord.title = this.measureToAdd;
    }
    newMeasureRecord.content = '';
    if (measurePlaceholder) {
      newMeasureRecord.placeholder = measurePlaceholder;
    } else {
      newMeasureRecord.placeholder = 'measures.default_placeholder';
    }
    this.measureApi.create(newMeasureRecord).subscribe((newMeasure: MeasureModel) => {
      this._globalEvaluationService.validate();
      newMeasureRecord.fromJson(newMeasure);
      this.measures.unshift(newMeasureRecord);
    });
  }
}
