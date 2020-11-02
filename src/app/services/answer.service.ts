import { Injectable } from '@angular/core';
import { ApplicationDb } from '../application.db';
import { Answer } from '../models/answer.model';

@Injectable()
export class AnswerService extends ApplicationDb {

  constructor() {
    super(201707071818, 'answer');
  }

  // TODO: Move Methods from model here
  async create(answer: Answer): Promise<Answer> {
    this.created_at = new Date();
    const data = {
      pia_id: this.pia_id,
      reference_to: this.reference_to,
      data: answer.data,
      created_at: this.created_at
    };
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl(), {
          method: 'POST',
          body: this.setFormData(data),
          mode: 'cors'
        })
          .then(response => {
            return response.json();
          })
          .then((result: any) => {
            answer.id = result.id;
            resolve(answer);
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
            answer.id = event.target.result;
            resolve();
          };
        });
      }
    });
  }

  async update(answer: Answer): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(answer.id).then((entry: any) => {
        entry.data = answer.data;
        entry.updated_at = new Date();
        if (this.serverUrl) {
          fetch(this.getServerUrl() + '/' + answer.id, {
            method: 'PATCH',
            body: this.setFormData(entry),
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
            const evt = this.objectStore.put(entry);
            evt.onerror = (event: any) => {
              console.error(event);
              reject(Error(event));
            };
            evt.onsuccess = (result) => {
              resolve(result);
            };
          });
        }
      });
    });
  }

  private setFormData(data): FormData{
    const formData = new FormData();
    for (const d in data) {
      if (data.hasOwnProperty(d)) {
        if (data[d] instanceof Object) {
          for (const d2 in data[d]) {
            if (data[d].hasOwnProperty(d2)) {
              if (data[d][d2] instanceof Array) {
                for (const d3 in data[d][d2]) {
                  if (data[d].hasOwnProperty(d2)) {
                    if (data[d][d2][d3]) {
                      formData.append('answer[' + d + '][' + d2 + '][]', data[d][d2][d3]);
                    }
                  }
                }
              } else {
                if (data[d][d2]) {
                  formData.append('answer[' + d + '][' + d2 + ']', data[d][d2]);
                } else {
                  formData.append('answer[' + d + '][' + d2 + ']', '');
                }
              }
            }
          }
        } else {
          if (data[d]) {
            formData.append('answer[' + d + ']', data[d]);
          } else {
            formData.append('answer[' + d + ']', '');
          }
        }
      }
    }
    return formData;
  }

  // async get(id: number) {
  //   this.id = id;
  //   return new Promise((resolve, reject) => {
  //     this.find(this.id).then((entry: any) => {
  //       this.pia_id = parseInt(entry.pia_id, 10);
  //       this.reference_to = entry.reference_to;
  //       this.data = entry.data;
  //       this.created_at = new Date(entry.created_at);
  //       this.updated_at = new Date(entry.updated_at);
  //       resolve();
  //     });
  //   });
  // }

  async getByReferenceAndPia(pia_id: number, reference_to: any): Promise<any> {
    console.log(pia_id, reference_to);

    this.pia_id = pia_id;
    this.reference_to = reference_to;
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl() + '?reference_to=' + this.reference_to, {
          mode: 'cors'
        })
          .then(response => {
            return response.json();
          })
          .then((result: any) => {
            if (result) {
              resolve(result);
            } else {
              resolve(false);
            }
          })
          .catch(error => {
            console.error('Request failed', error);
            reject();
          });
      } else {
        this.getObjectStore().then(() => {
          const index1 = this.objectStore.index('index1');
          const evt = index1.get(IDBKeyRange.only([this.pia_id, this.reference_to]));
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            const entry = event.target.result;
            if (entry) {
              resolve(entry);
            } else {
              resolve(false);
            }
          };
        });
      }
    });
  }

  async findAllByPia(pia_id: number): Promise<any> {
    const items = [];
    this.pia_id = pia_id;
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
          const index1 = this.objectStore.index('index2');
          const evt = index1.openCursor(IDBKeyRange.only(this.pia_id));
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

  async getGaugeByPia(pia_id: number): Promise<any> {
    const items = [];
    this.pia_id = pia_id;
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
          const index2 = this.objectStore.index('index2');
          const evt = index2.openCursor(IDBKeyRange.only(this.pia_id));
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
