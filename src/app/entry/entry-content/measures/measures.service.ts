import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Measure } from './measure.model';

import { ModalsService } from 'app/modals/modals.service';
import { TranslateService } from '@ngx-translate/core';
import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';

@Injectable()
export class MeasureService {
  public behaviorSubject = new BehaviorSubject<string>(null);
  measures: any[];
  measureToAdd: any;
  pia_id: number;

  constructor(private _translateService: TranslateService,
              private _modalsService: ModalsService,
              private _knowledgeBaseService: KnowledgeBaseService,
              private _globalEvaluationService: GlobalEvaluationService) {}

  /**
   * List the measures.
   * @param {number} pia_id - The Pia id.
   * @returns {Promise}
   * @memberof MeasureService
   */
  async listMeasures(pia_id: number) {
    this.pia_id = pia_id;
    return new Promise((resolve, reject) => {
      const measuresModel = new Measure();
      measuresModel.pia_id = this.pia_id;
      measuresModel.findAll().then((entries: any[]) => {
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
    const measure = new Measure();
    measure.pia_id = this.pia_id;

    measure.get(measure_id).then(() => {
      this.behaviorSubject.next(measure.title);
      this._knowledgeBaseService.toHide = this._knowledgeBaseService.toHide.filter(item => item !== measure.title);
    });

    /* Removing from DB */
    measure.delete(measure_id);

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
    const newMeasureRecord = new Measure();
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
    newMeasureRecord.create().then((entry: number) => {
      this._globalEvaluationService.validate();
      newMeasureRecord.id = entry;
      this.measures.unshift(newMeasureRecord);
    });
  }
}
