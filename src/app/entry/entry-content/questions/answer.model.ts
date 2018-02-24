import { ApplicationDb } from '../../../application.db';

export class Answer extends ApplicationDb {
  public id: number;
  public data: { text: string, gauge: number, list: string[] };
  public answer_type: string;

  constructor() {
    super(201707071818, 'answer');
  }

  async create() {
    this.created_at = new Date();
    const data = {
          pia_id: this.pia_id,
          reference_to: this.reference_to,
          data: this.data,
          created_at: this.created_at
        };
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl(), {
          method: 'POST',
          body: this.setFormData(data)
        }).then((response) => {
          return response.json();
        }).then((result: any) => {
          this.id = result.id;
          resolve();
        }).catch ((error) => {
          console.error('Request failed', error);
          reject();
        });
      } else {
        this.getObjectStore().then(() => {
          const evt = this.objectStore.add(data);
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          }
          evt.onsuccess = (event: any) => {
            this.id = event.target.result;
            resolve();
          };
        });
      }
    });
  }

  async update() {
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        entry.data = this.data;
        entry.updated_at = new Date();
        if (this.serverUrl) {
          fetch(this.getServerUrl() + '/' + this.id, {
            method: 'PATCH',
            body: this.setFormData(entry)
          }).then((response) => {
            return response.json();
          }).then((result: any) => {
            resolve();
          }).catch ((error) => {
            console.error('Request failed', error);
            reject();
          });
        } else {
          this.getObjectStore().then(() => {
            const evt = this.objectStore.put(entry);
            evt.onerror = (event: any) => {
              console.error(event);
              reject(Error(event));
            }
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
                }
              }
            }
          }
        } else {
          if (data[d]) {
            formData.append('answer[' + d + ']', data[d]);
          }
        }
      }
    }
    return formData;
  }

  async get(id: number) {
    this.id = id;
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        this.pia_id = parseInt(entry.pia_id, 10);
        this.reference_to = entry.reference_to;
        this.data = entry.data;
        this.created_at = new Date(entry.created_at);
        this.updated_at = new Date(entry.updated_at);
        resolve();
      });
    });
  }

  async getByReferenceAndPia(pia_id: number, reference_to: any) {
    this.pia_id = pia_id;
    this.reference_to = reference_to;
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl() + '?reference_to=' + this.reference_to).then((response) => {
          return response.json();
        }).then((result: any) => {
          if (result) {
            this.id = result.id;
            this.reference_to = result.reference_to;
            this.data = result.data;
            this.created_at = new Date(result.created_at);
            this.updated_at = new Date(result.updated_at);
            resolve(true);
          } else {
            resolve(false);
          }
        }).catch ((error) => {
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
          }
          evt.onsuccess = (event: any) => {
            const entry = event.target.result;
            if (entry) {
              this.id = entry.id;
              this.reference_to = entry.reference_to;
              this.data = entry.data;
              this.created_at = new Date(entry.created_at);
              this.updated_at = new Date(entry.updated_at);
              resolve(true);
            } else {
              resolve(false);
            }
          }
        });
      }
    });
  }

  async findAllByPia(pia_id: number) {
    const items = [];
    this.pia_id = pia_id;
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl()).then((response) => {
          return response.json();
        }).then((result: any) => {
          resolve(result);
        }).catch ((error) => {
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
          }
          evt.onsuccess = (event: any) => {
            const cursor = event.target.result;
            if (cursor) {
              items.push(cursor.value);
              cursor.continue();
            } else {
              resolve(items);
            }
          }
        });
      }
    });
  }

  async getGaugeByPia(pia_id: number) {
    const items = [];
    this.pia_id = pia_id;
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl()).then((response) => {
          return response.json();
        }).then((result: any) => {
          resolve(result);
        }).catch ((error) => {
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
          }
          evt.onsuccess = (event: any) => {
            const cursor = event.target.result;
            if (cursor) {
              items.push(cursor.value);
              cursor.continue();
            } else {
              resolve(items);
            }
          }
        });
      }
    });
  }
}
