import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDb } from '../application.db';
import { Evaluation } from '../models/evaluation.model';

@Injectable()
export class EvaluationService extends ApplicationDb {
  constructor(private router?: Router) {
    super(201707071818, 'evaluation');
    super.prepareServerUrl(this.router);
  }

  async create(evaluation: Evaluation): Promise<Evaluation> {
    const data = {
      ...evaluation,
      created_at: new Date()
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

  async update(evaluation: Evaluation): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(evaluation.id).then((entry: any) => {
        entry = {
          ...entry,
          ...evaluation
        };
        entry.updated_at = new Date();
        if (this.serverUrl) {
          fetch(this.getServerUrl() + '/' + evaluation.id, {
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
            evt.onsuccess = () => {
              resolve();
            };
          });
        }
      });
    });
  }

  private setFormData(data) {
    const formData = new FormData();
    for (const d in data) {
      if (data.hasOwnProperty(d) && data[d]) {
        if (d === 'gauges') {
          for (const dd in data[d]) {
            if (data[d].hasOwnProperty(dd) && data[d][dd]) {
              formData.append('evaluation[' + d + '][' + dd + ']', data[d][dd]);
            }
          }
        } else {
          formData.append('evaluation[' + d + ']', data[d]);
        }
      }
    }
    return formData;
  }

  /* Get an evaluation for a specific question or a specific measure */
  async getByReference(pia_id: number, reference_to: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl() + '?reference_to=' + reference_to, {
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
          const evt = index1.get(IDBKeyRange.only([pia_id, reference_to]));
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            const entry = event.target.result;
            resolve(entry);
          };
        });
      }
    });
  }

  async findAllByPia(pia_id: number) {
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

  // async findAll() {
  //   const items = [];
  //   return new Promise((resolve, reject) => {
  //     if (this.serverUrl) {
  //       fetch(this.getServerUrl(), {
  //         mode: 'cors'
  //       }).then((response) => {
  //         return response.json();
  //       }).then((result: any) => {
  //         resolve(result);
  //       }).catch((error) => {
  //         console.error('Request failed', error);
  //         reject();
  //       });
  //     } else {
  //       this.getObjectStore().then(() => {
  //         const index1 = this.objectStore.index('index2');
  //         const evt = index1.openCursor(IDBKeyRange.only(this.pia_id));
  //         evt.onerror = (event: any) => {
  //           console.error(event);
  //           reject(Error(event));
  //         }
  //         evt.onsuccess = (event: any) => {
  //           const cursor = event.target.result;
  //           if (cursor) {
  //             items.push(cursor.value);
  //             cursor.continue();
  //           } else {
  //             resolve(items);
  //           }
  //         }
  //       });
  //     }
  //   });
  // }

  async existByReference(pia_id: number, reference_to: any) {
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl() + '?reference_to=' + reference_to, {
          mode: 'cors'
        })
          .then(response => {
            return response.json();
          })
          .then((result: any) => {
            if (result && result.length > 0) {
              resolve(true);
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
          const evt = index1.get(IDBKeyRange.only([pia_id, reference_to]));
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            const entry = event.target.result;
            if (entry) {
              resolve(true);
            } else {
              resolve(false);
            }
          };
        });
      }
    });
  }

  async globalStatusByReference(
    pia_id: number,
    reference_to: any,
    global_status: number
  ) {
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl() + '?reference_to=' + reference_to, {
          mode: 'cors'
        })
          .then(response => {
            return response.json();
          })
          .then((result: any) => {
            if (result) {
              resolve(result.global_status === global_status);
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
          const evt = index1.get(IDBKeyRange.only([pia_id, reference_to]));
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            const entry = event.target.result;
            if (entry) {
              resolve(entry.global_status === global_status);
            } else {
              resolve(false);
            }
          };
        });
      }
    });
  }

  getStatusName(status) {
    return 'evaluations.status.' + status;
  }
}
