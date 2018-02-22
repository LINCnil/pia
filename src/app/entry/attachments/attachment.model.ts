import { ApplicationDb } from '../../application.db';

export class Attachment extends ApplicationDb {
  public id: number;
  public file: Blob;
  public name: string;
  public mime_type: string;
  public pia_signed = 0;
  public history_comment: string;

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
          history_comment: this.history_comment,
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
