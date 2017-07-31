import { Injectable } from '@angular/core';
import { Measure } from './measure.model';
import { ModalsService } from 'app/modals/modals.service';

@Injectable()
export class MeasureService {
  private _modalsService = new ModalsService();
  measures: any[];

  /**
   * Allows an user to remove a measure ("RISKS" section).
   */
  removeMeasure() {
    const measure_id = parseInt(localStorage.getItem('measure-id'), 10);
    /* Removing from DB */
    const measure = new Measure();
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
    }
    newMeasureRecord.create().then((entry: number) => {
      newMeasureRecord.id = entry;
      this.measures.push(newMeasureRecord);
    });
  }
}
