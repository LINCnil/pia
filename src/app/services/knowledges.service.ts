import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
import { utf8Encode } from '@angular/compiler/src/util';
import { KnowledgeBase } from '../models/knowledgeBase.model';

import { ModalsService } from './modals.service';
import { Knowledge } from '../models/knowledge.model';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationDb } from '../application.db';
@Injectable()
export class KnowledgesService extends ApplicationDb {

  constructor(
    private translateService: TranslateService) {
      super(201911191636, 'knowledge');
    }

  public getEntries(baseId): Promise<any> {
    return new Promise((resolve, reject) => {
        this.findAllByBaseId(baseId)
          .then(response => {
            resolve(response);
          })
          .catch(err => {
            reject(err);
          });
    });
  }



  /**
   * Create a new Knowledge ENTRY.
   * @returns - New Promise
   */
  async create(baseId: number, knowledge: Knowledge) {
    knowledge.knowledgeBase_id = baseId;

    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
      } else {
        this.getObjectStore().then(() => {
          const evt = this.objectStore.add(knowledge);
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            resolve({ ...knowledge, id: event.target.result });
          };
        });
      }
    });
  }

  public remove(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.delete(id)
        .then(() => {
          resolve();
        })
        .catch(error => {
          reject(true);
        });
    });
  }

  /**
   * Download the Knowledges exported.
   * @param {number} id - The Structure id.
   */
  export(id: number): void {
    const date = new Date().getTime();
    this.find(id).then(data => {
      const a = document.getElementById('pia-exportBlock');
      const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      a.setAttribute('href', url);
      a.setAttribute('download', date + '_export_knowledgebase_' + id + '.json');
      const event = new MouseEvent('click', {
        view: window
      });
      a.dispatchEvent(event);
    });
  }

  import(data): Promise<KnowledgeBase> {
    return new Promise((resolve, reject) => {
      const newKnowledgeBase = new KnowledgeBase(null, data.name + ' (copy)', data.author, data.contributors, data.knowleges);
      newKnowledgeBase
        .create()
        .then((resp: KnowledgeBase) => {
          newKnowledgeBase.id = resp.id;
          resolve(newKnowledgeBase);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  }

  /**
   * List all Knowledge by base id
   * @param baseId Id of base
   */
  private async findAllByBaseId(baseId: number) {
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
        this.getObjectStore()
          .then((obj: any) => {
            const index1 = obj.index('index1');
            const evt = index1.openCursor(IDBKeyRange.only(baseId));
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
}
