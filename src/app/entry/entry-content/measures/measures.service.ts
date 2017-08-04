import { Injectable } from '@angular/core';

import { Measure } from './measure.model';

import { ModalsService } from 'app/modals/modals.service';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';

@Injectable()
export class MeasureService {

  measures: any[];

  constructor(private _modalsService: ModalsService, private _evaluationService: EvaluationService) {}

  /**
   * Allows an user to remove a measure ("RISKS" section).
   */
  removeMeasure() {
    const measure_id = parseInt(localStorage.getItem('measure-id'), 10);
    /* Removing from DB */
    const measure = new Measure();
    measure.delete(measure_id).then(() => {
      this._evaluationService.allowEvaluation();
    });

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
   * @param {string} measureTitle the title of the measure to be added (used in some cases).
   */
  addNewMeasure(pia: any, measureTitle?: string, measurePlaceholder?: string) {
    const newMeasureRecord = new Measure();
    newMeasureRecord.pia_id = pia.id;
    if (measureTitle) {
      newMeasureRecord.title = measureTitle;
    }
    if (measurePlaceholder) {
      newMeasureRecord.placeholder = measurePlaceholder;
    } else {
      newMeasureRecord.placeholder = 'Ajouter les mesures prises pour garantir la sécurité des données';
    }
    newMeasureRecord.create().then((entry: number) => {
      this._evaluationService.allowEvaluation();
      newMeasureRecord.id = entry;
      this.measures.push(newMeasureRecord);
    });
  }
}
