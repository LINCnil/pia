import { Injectable } from '@angular/core';

import { Knowledge } from '../models/knowledge.model';
import { ApplicationDb } from '../application.db';
import { Router } from '@angular/router';

@Injectable()
export class KnowledgesService extends ApplicationDb {
  constructor(private router: Router) {
    super(201911191636, 'knowledge');
    super.prepareServerUrl(this.router);
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
  async create(baseId: number, knowledge: Knowledge): Promise<Knowledge> {
    this.knowledge_base_id = baseId;
    knowledge.knowledge_base_id = baseId;

    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        const formData = new FormData();
        for (const d in knowledge) {
          if (knowledge.hasOwnProperty(d)) {
            let value = knowledge[d];
            if (d === 'data' || d === 'items') {
              value = JSON.stringify(value);
            }
            formData.append('knowledge[' + d + ']', value);
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
            resolve(result);
          })
          .catch(error => {
            console.error('Request failed', error);
            reject();
          });
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

  async update(knowledge: Knowledge): Promise<void> {
    return new Promise((resolve, reject) => {
      this.find(knowledge.id).then((entry: any) => {
        entry.slug = knowledge.slug;
        entry.filters = knowledge.filters;
        entry.category = knowledge.category;
        entry.placeholder = knowledge.placeholder;
        entry.name = knowledge.name;
        entry.description = knowledge.description;
        entry.knowledgeBase_id = knowledge.knowledgeBase_id;
        (entry.items = knowledge.items), (entry.created_at = entry.created_at);
        entry.updated_at = new Date();

        if (this.serverUrl) {
          const formData = new FormData();
          for (const d in entry) {
            if (entry.hasOwnProperty(d)) {
              let value = entry[d];
              if (d === 'data' || d === 'items') {
                value = JSON.stringify(value);
              }
              formData.append('knowledge[' + d + ']', value);
            }
          }
          fetch(this.getServerUrl() + '/' + entry.id, {
            method: 'PATCH',
            body: formData,
            mode: 'cors'
          })
            .then(response => {
              resolve();
              return response.json();
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
            evt.onsuccess = () => {
              resolve();
            };
          });
        }
      });
    });
  }

  async duplicate(baseId: number, id: number): Promise<Knowledge> {
    return new Promise((resolve, reject) => {
      this.find(id).then((entry: Knowledge) => {
        const temp = new Knowledge();
        temp.slug = entry.slug;
        temp.filters = entry.filters;
        temp.category = entry.category;
        temp.placeholder = entry.placeholder;
        temp.name = entry.name;
        temp.description = entry.description;
        temp.items = entry.items;
        temp.created_at = entry.created_at;
        temp.updated_at = entry.updated_at;
        this.create(baseId, temp)
          .then((result: Knowledge) => {
            resolve(result);
          })
          .catch(err => {
            reject(err);
            console.error(err);
          });
      });
    });
  }

  /**
   * List all Knowledge by base id
   * @param baseId Id of base
   */
  private async findAllByBaseId(baseId: number): Promise<Array<Knowledge>> {
    const items = [];
    return new Promise((resolve, reject) => {
      this.knowledge_base_id = baseId;
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
        this.getObjectStore().then((obj: any) => {
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
