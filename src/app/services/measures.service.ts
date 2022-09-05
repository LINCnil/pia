import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDb } from '../application.db';
import { Measure } from '../models/measure.model';
import { ApiService } from './api.service';
import { KnowledgeBaseService } from './knowledge-base.service';

@Injectable()
export class MeasureService extends ApplicationDb {
  public behaviorSubject = new BehaviorSubject<string>(null);
  measureToAdd: any;
  pia_id: number;

  constructor(
    private router: Router,
    protected apiService: ApiService,
    private translateService?: TranslateService,
    private knowledgeBaseService?: KnowledgeBaseService
  ) {
    super(201707071818, 'measure');
    super.prepareApi(this.apiService);
    super.prepareServerUrl(this.router);
  }

  async create(measure: Measure): Promise<any> {
    measure.created_at = new Date();
    return new Promise((resolve, reject) => {
      super
        .create(measure, 'measure')
        .then((result: any) => {
          resolve(result.id);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  async update(measure: Measure): Promise<any> {
    return new Promise((resolve, reject) => {
      super.find(measure.id).then((entry: any) => {
        entry = {
          ...entry,
          ...measure
        };
        entry.updated_at = new Date();
        super
          .update(entry.id, entry, 'measure')
          .then((result: any) => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      });
    });
  }

  async findAllByPia(pia_id: number): Promise<any> {
    const items = [];
    return new Promise((resolve, reject) => {
      this.pia_id = pia_id;
      super
        .findAll(null, { index: 'index1', value: pia_id })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * List the measures.
   * @param pia_id - The Pia id.
   */
  async listMeasures(pia_id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.findAllByPia(pia_id)
        .then((entries: any[]) => {
          resolve(entries);
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  /**
   * Allows an user to remove a measure ("RISKS" section).
   */
  removeMeasure(measure_id): Promise<void> {
    return new Promise((resolve, reject) => {
      super.find(measure_id).then((entry: Measure) => {
        this.behaviorSubject.next(entry.title);
        this.knowledgeBaseService.toHide = this.knowledgeBaseService.toHide.filter(
          item => item !== entry.title
        );
      });

      /* Removing from DB */
      this.delete(measure_id).then(() => {
        resolve();
      });
    });
  }

  /**
   * Adds a new measure to the PIA (used in "RISKS" section, "Mesures existantes ou prévus" subsection).
   * @param pia - Any Pia.
   * @param [measureTitle] - The title of the measure to be added (used in some cases).
   * @param [measurePlaceholder] - The placeholder of the measure.
   */
  addNewMeasure(
    pia: any,
    measureTitle?: string,
    measurePlaceholder?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const newMeasureRecord = new Measure();
      newMeasureRecord.pia_id = pia.id;
      newMeasureRecord.title = '';
      if (measureTitle) {
        this.translateService
          .get(measureTitle)
          .subscribe(val => (this.measureToAdd = val));
        newMeasureRecord.title = this.measureToAdd;
      }
      newMeasureRecord.content = '';
      if (measurePlaceholder) {
        newMeasureRecord.placeholder = measurePlaceholder;
      } else {
        newMeasureRecord.placeholder = 'measures.default_placeholder';
      }

      super
        .create(newMeasureRecord, 'measure')
        .then((entry: any) => {
          // TODO: entry must be the Measure created
          newMeasureRecord.id = entry.id ? entry.id : entry;
          resolve(newMeasureRecord);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
