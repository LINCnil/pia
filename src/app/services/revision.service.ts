import { Injectable } from '@angular/core';

import { PiaService } from './pia.service';
import { Router } from '@angular/router';
import { Revision } from '../models/revision.model';
import { ApplicationDb } from '../application.db';

@Injectable()
export class RevisionService extends ApplicationDb {
  public revisionSelected: number;

  constructor(public piaService: PiaService, private router: Router) {
    super(201911191636, 'revision');
  }

  /**
   * List all revisions
   * @param piaId - The PIA id
   */
  async findAllByPia(piaId: number): Promise<any> {
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
          const evt = index1.openCursor(IDBKeyRange.only(piaId));
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
   * Get a Revision.
   * @param id - The Revision id.
   * @returns - New Promise
   */
  async get(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(id).then((entry: any) => {
        if (entry) {
          this.export = entry.export;
          this.created_at = new Date(entry.created_at);
        }
        resolve();
      });
    });
  }

  /**
   * Create a new Structure.
   * @returns - New Promise
   */
  async create(revision): Promise<any> {
    const data = {
      ...revision,
      created_at: new Date()
    };
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        const formData = new FormData();
        for (const d in data) {
          if (data.hasOwnProperty(d)) {
            let value = data[d];
            if (d === 'data') {
              value = JSON.stringify(value);
            }
            formData.append('revision[' + d + ']', value);
          }
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
            resolve({ ...result, id: result.id });
          })
          .catch(error => {
            console.error('Request failed', error);
            reject(error);
          });
      } else {
        this.getObjectStore().then(() => {
          const evt = this.objectStore.add(data);
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            resolve({...data, id: event.target.result});
          };
        });
      }
    });
  }

  /**
   * Load a new revision
   */
  async loadRevision(revisionId): Promise<void> {
    return new Promise(resolve => {
      this.find(revisionId).then((revision: Revision) => {
        const piaExport = JSON.parse(revision.export);
        this.piaService.replacePiaByExport(piaExport, true, true, revision.created_at)
        .then((pia) => {
          resolve(piaExport);
        });
      });
    });
  }

  /**
   * Create new revision
   * @param piaExport - The PIA exported
   * @param piaId - The PIA id
   */
  async add(piaExport, piaId) {
    return new Promise((resolve, reject) => {
      const revision = new Revision();
      revision.pia_id = piaId;
      revision.export = piaExport;
      this.create(revision).then((response: any) => {
        resolve(response);
      })
      .catch(err => reject(err));
    });
  }

  async export(id: number) {
    return new Promise(async (resolve, reject) => {
      await this.piaService.calculPiaProgress;
      this.piaService.exportData(id).then(data => {
        const finalData = JSON.stringify(data);
        resolve(finalData);
      });
    });
  }

  /**
   * Get the status of the PIA.
   * @returns {string} - Locale for translation.
   */
  getStatusName(status) {
    if (status >= 0) {
      return `pia.statuses.${status}`;
    }
  }

  /**
   * Get gauge name.
   * @param {*} value - The gauge value.
   * @returns {string} - Locale for translation.
   */
  getGaugeName(value: any) {
    if (value) {
      return `summary.gauges.${value}`;
    }
  }
}
