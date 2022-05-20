import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDb } from '../application.db';
import { Comment } from '../models/comment.model';

@Injectable()
export class CommentsService extends ApplicationDb {
  constructor(private router: Router) {
    super(201709122303, 'comment');
    super.prepareServerUrl(this.router);
  }

  async create(comment: Comment): Promise<any> {
    comment.created_at = new Date();
    const data = {
      ...comment
    };
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        const formData = new FormData();
        for (const d in data) {
          if (data.hasOwnProperty(d) && data[d]) {
            formData.append('comment[' + d + ']', data[d]);
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
            resolve(result.id);
          })
          .catch(error => {
            console.error('Request failed', error);
            reject();
          });
      } else {
        this.getObjectStore().then(() => {
          const evt = this.objectStore.add(data);
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

  async findAllByPia(pia_id: number): Promise<Array<Comment>> {
    const items = [];
    return new Promise((resolve, reject) => {
      this.pia_id = pia_id;
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
          const index1 = this.objectStore.index('index2');
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

  async findAllByReference(piaId, referenceTo): Promise<any> {
    const items = [];
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl() + '?reference_to=' + referenceTo, {
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
          const evt = index1.openCursor(IDBKeyRange.only([piaId, referenceTo]));
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

  async update(comment: Comment): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(comment.id).then((entry: any) => {
        entry = {
          ...entry,
          ...comment
        };
        entry.updated_at = new Date(entry.updated_at);
        // update indexDB / comment
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
      });
    });
  }
}
