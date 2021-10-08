import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDb } from '../application.db';
import { Measure } from '../models/measure.model';
import { KnowledgeBaseService } from './knowledge-base.service';

@Injectable()
export class MeasureService extends ApplicationDb {
  public behaviorSubject = new BehaviorSubject<string>(null);
  measureToAdd: any;
  pia_id: number;

  constructor(
    private router: Router,
    private translateService?: TranslateService,
    private knowledgeBaseService?: KnowledgeBaseService
  ) {
    super(201707071818, 'measure');
    super.prepareServerUrl(this.router);
  }

  async create(measure: Measure): Promise<any> {
    this.created_at = new Date();
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        const formData = new FormData();
        for (let d in measure) {
          formData.append('measure[' + d + ']', measure[d]);
        }
        fetch(this.getServerUrl(), {
          method: 'POST',
          body: formData,
          mode: 'cors'
        })
          .then(response => {
            return response.json();
          })
          .then((result: any) => {
            resolve(result.id);
          })
          .catch(error => {
            console.error('Request failed', error);
            reject();
          });
      } else {
        this.getObjectStore().then(() => {
          const evt = this.objectStore.add(measure);
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            resolve(event.target.result);
          };
        });
      }
    });
  }

  async update(measure: Measure): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(measure.id).then((entry: any) => {
        entry = {
          ...entry,
          ...measure
        };
        entry.updated_at = new Date();
        if (this.serverUrl) {
          const formData = new FormData();
          for (let d in entry) {
            formData.append('measure[' + d + ']', entry[d]);
          }
          fetch(this.getServerUrl() + '/' + entry.id, {
            method: 'PATCH',
            body: formData,
            mode: 'cors'
          })
            .then(response => {
              return response.json();
            })
            .then((result: any) => {
              resolve();
            })
            .catch(error => {
              console.error('Request failed', error);
              reject();
            });
        } else {
          this.getObjectStore().then(() => {
            const evt = this.objectStore.put(entry);
            evt.onerror = (event: any) => {
              console.error(event);
              reject(Error(event));
            };
            evt.onsuccess = (event: any) => {
              resolve();
            };
          });
        }
      });
    });
  }

  async findAllByPia(pia_id: number): Promise<any> {
    const items = [];
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl(), {
          mode: 'cors'
        })
          .then(response => {
            return response.json();
          })
          .then((result: any) => {
            resolve(result);
          })
          .catch(error => {
            console.error('Request failed', error);
            reject();
          });
      } else {
        this.getObjectStore().then(() => {
          const index1 = this.objectStore.index('index1');
          const evt = index1.openCursor(IDBKeyRange.only(pia_id));
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            const cursor = event.target.result;
            if (cursor) {
              items.push(cursor.value);
              cursor.continue();
            } else {
              resolve(items);
            }
          };
        });
      }
    });
  }

  /**
   * List the measures.
   * @param pia_id - The Pia id.
   */
  async listMeasures(pia_id: number): Promise<any> {
    // this.pia_id = pia_id;
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
      this.find(measure_id).then((entry: Measure) => {
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
      this.create(newMeasureRecord).then((entry: number) => {
        newMeasureRecord.id = entry;
        resolve(newMeasureRecord);
      });
    });
  }
}
