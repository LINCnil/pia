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
    private router: Router,
    private mmodalsService: ModalsService,
    private translateService: TranslateService) {
      super(201911191636, 'knowledgeBase');
    }

  public getAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.findAll()
        .then((response: any) => {
          const result: KnowledgeBase[] = [];
          response.forEach(e => {
            result.push(new KnowledgeBase(e.id, e.name, e.author, e.contributors, e.created_at));
          });

          // Parse default Knowledge base json
          const cnilKnowledgeBase = new KnowledgeBase(
            0,
            this.translateService.instant('knowledge_base.default_knowledge_base'),
            'CNIL',
            'CNIL'
          );
          cnilKnowledgeBase.is_example = true;

          result.push(cnilKnowledgeBase);
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
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

  duplicate(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const date = new Date().getTime();
      this.find(id).then((data: KnowledgeBase) => {
        this.import(data)
        .then((newKnowledgeBase: KnowledgeBase) => {
          // Duplicate entries
          this.getEntries(id).then((knowledges: Knowledge[]) => {
            knowledges.forEach((entry: Knowledge) => {
              const temp = new Knowledge();
              temp.id = entry.id;
              temp.slug = entry.slug;
              temp.filters = entry.filters;
              temp.category = entry.category;
              temp.placeholder = entry.placeholder;
              temp.name = entry.name;
              temp.description = entry.description;
              temp.items = entry.items;
              temp.created_at = new Date(entry.created_at);
              temp.updated_at = new Date(entry.updated_at);
              temp.create(newKnowledgeBase.id).then(e => {
                console.log(e);
              });
            });
          });
          resolve();
        })
        .catch((err) => {
          console.error(err);
        });
      });
    });
  }

  /**
  * List all Knowledge by base id
  * @param piaId - The PIA id
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
          .then(() => {
            const index1 = this.objectStore.index('index1');
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
