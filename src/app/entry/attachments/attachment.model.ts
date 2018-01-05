import { ApplicationDb } from '../../application.db';

export class Attachment extends ApplicationDb {
  public id: number;
  public file: Blob;
  public name: string;
  public mime_type: string;
  public pia_signed = 0;

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
        });
      } else {
        const evt = this.objectStore.add(data);
        evt.onsuccess = (event: any) => {
          resolve(event.target.result);
        };
        evt.onerror = (event: any) => {
          console.error(event);
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
          });
        } else {
          const index1 = this.objectStore.index('index1');
          index1.openCursor(IDBKeyRange.only(this.pia_id)).onsuccess = (event: any) => {
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

  async getSignedPia() {
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl() + '/signed').then(function(response) {
          return response.json();
        }).then(function(result: any) {
          resolve(result);
        }).catch (function (error) {
          console.error('Request failed', error);
        });
      } else {
        const index2 = this.objectStore.index('index2');
        index2.get(IDBKeyRange.only([this.pia_id, 1])).onsuccess = (event: any) => {
          const entry = event.target.result;
          resolve(entry);
        }
      }
    });
  }
}
