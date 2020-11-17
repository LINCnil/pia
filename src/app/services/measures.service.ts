import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Measure } from '../models/measure.model';
import { GlobalEvaluationService } from './global-evaluation.service';
import { KnowledgeBaseService } from './knowledge-base.service';


@Injectable()
export class MeasureService {
  public behaviorSubject = new BehaviorSubject<string>(null);
  measures: any[];
  measureToAdd: any;
  pia_id: number;

  constructor(private translateService: TranslateService,
              private knowledgeBaseService: KnowledgeBaseService,
              private globalEvaluationService: GlobalEvaluationService) {}

  /**
   * List the measures.
   * @param pia_id - The Pia id.
   */
  async listMeasures(pia_id: number): Promise<void>{
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
   */
  removeMeasure(measure_id): void {
    const measure = new Measure();
    measure.pia_id = this.pia_id;

    measure.get(measure_id).then(() => {
      this.behaviorSubject.next(measure.title);
      this.knowledgeBaseService.toHide = this.knowledgeBaseService.toHide.filter(item => item !== measure.title);
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
  }

  /**
   * Adds a new measure to the PIA (used in "RISKS" section, "Mesures existantes ou prévus" subsection).
   * @param pia - Any Pia.
   * @param [measureTitle] - The title of the measure to be added (used in some cases).
   * @param [measurePlaceholder] - The placeholder of the measure.
   */
  addNewMeasure(pia: any, measureTitle?: string, measurePlaceholder?: string): void {
    const newMeasureRecord = new Measure();
    newMeasureRecord.pia_id = pia.id;
    newMeasureRecord.title = '';
    if (measureTitle) {
      this.translateService.get(measureTitle).subscribe(val => this.measureToAdd = val);
      newMeasureRecord.title = this.measureToAdd;
    }
    newMeasureRecord.content = '';
    if (measurePlaceholder) {
      newMeasureRecord.placeholder = measurePlaceholder;
    } else {
      newMeasureRecord.placeholder = 'measures.default_placeholder';
    }
    newMeasureRecord.create().then((entry: number) => {
      this.globalEvaluationService.validate();
      newMeasureRecord.id = entry;
      this.measures.unshift(newMeasureRecord);
    });
  }
}
