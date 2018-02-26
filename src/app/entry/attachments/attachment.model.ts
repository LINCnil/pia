import { ApplicationDb } from '../../application.db';

export class Attachment extends ApplicationDb {
  public id: number;
  public file: Blob;
  public name: string;
  public mime_type: string;
  public pia_signed = 0;
  public comment: string;

  constructor() {
    super(201708291502, 'attachment');
  }

  async create() {
    this.created_at = new Date();
    const data = {
          name: this.name,
          mime_type: this.mime_type,
          pia_id: this.pia_id,
          pia_signed: this.pia_signed,
          file: this.file,
          comment: this.comment,
          created_at: this.created_at
        };
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        const formData = new FormData();
        for (const d in data) {
          if (data.hasOwnProperty(d)) {
            formData.append('attachment[' + d + ']', data[d]);
          }
        }
        fetch(this.getServerUrl(), {
          method: 'POST',
          body: formData
        }).then(function(response) {
          return response.json();
        }).then(function(result: any) {
          resolve(result.id);
        }).catch (function (error) {
          console.error('Request failed', error);
          reject();
        });
      } else {
        const evt = this.objectStore.add(data);
        evt.onsuccess = (event: any) => {
          resolve(event.target.result);
        };
        evt.onerror = (event: any) => {
          console.error(event);
          reject(Error(event));
        }
      }
    });
  }

  async remove(comment: string) {
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        entry.file = null;
        entry.comment = comment;
        entry.updated_at = new Date();
        if (this.serverUrl) {
          const formData = new FormData();
          for (const d in entry) {
            if (entry.hasOwnProperty(d)) {
              formData.append('attachment[' + d + ']', entry[d]);
            }
          }
          fetch(this.getServerUrl() + '/' + entry.id, {
            method: 'PATCH',
            body: formData
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

  async findAll() {
    const items = [];
    if (this.pia_id) {
      await this.getObjectStore();
      return new Promise((resolve, reject) => {
        if (this.serverUrl) {
          fetch(this.getServerUrl()).then(function(response) {
            return response.json();
          }).then(function(result: any) {
            resolve(result);
          }).catch (function (error) {
            console.error('Request failed', error);
            reject();
          });
        } else {
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
        }
      });
    }
  }

}
