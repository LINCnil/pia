import { ApplicationDb } from '../../../application.db';

export class Measure extends ApplicationDb {
  public id: number;
  public title: string;
  public content: string;
  public placeholder: string;

  constructor() {
    super(201707071818, 'measure');
  }

  async create() {
    this.created_at = new Date();
    const data = {
        title: this.title,
        pia_id: this.pia_id,
        content: this.content,
        placeholder: this.placeholder,
        created_at: this.created_at
      };
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        const formData = new FormData();
        for(let d in data) {
          formData.append('measure[' + d + ']', data[d]);
        }
        fetch(this.getServerUrl(), {
          method: 'POST',
          body: formData
        }).then((response) => {
          return response.json();
        }).then((result: any) => {
          resolve(result.id);
        }).catch((error) => {
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
            resolve(event.target.result);
          };
        });
      }
    });
  }

  async update() {
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        entry.title = this.title;
        entry.content = this.content;
        entry.updated_at = new Date();
        if (this.serverUrl) {
          const formData = new FormData();
          for(let d in entry) {
            formData.append('measure[' + d + ']', entry[d]);
          }
          fetch(this.getServerUrl() + '/' + this.id, {
            method: 'PATCH',
            body: formData
          }).then((response) => {
            return response.json();
          }).then((result: any) => {
            resolve();
          }).catch((error) => {
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
            evt.onsuccess = (event: any) => {
              resolve();
            };
          });
        }
      });
    });
  }

  async get(id: number) {
    this.id = id;
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        this.pia_id = parseInt(entry.pia_id, 10);
        this.reference_to = entry.reference_to;
        this.title = entry.title;
        this.content = entry.content;
        this.placeholder = entry.placeholder;
        this.created_at = new Date(entry.created_at);
        this.updated_at = new Date(entry.updated_at);
        resolve();
      });
    });
  }

  async findAll() {
    const items = [];
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl()).then((response) => {
          return response.json();
        }).then((result: any) => {
          resolve(result);
        }).catch((error) => {
          console.error('Request failed', error);
          reject();
        });
      } else {
        this.getObjectStore().then(() => {
          const index1 = this.objectStore.index('index1');
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
}
