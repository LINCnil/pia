import { ApplicationDb } from '../application.db';

export class Revision extends ApplicationDb {
  public id: number;
  public export: any;

  constructor() {
    super(201911191636, 'revision');
    this.created_at = new Date();
  }

  /**
   * List all revisions
   * @param piaId - The PIA id
   */
  async findAllByPia(piaId: number) {
    const items = [];
    this.pia_id = piaId;
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
          const index1 = this.objectStore.index('index1');
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

  /**
   * Get a Revision.
   * @param id - The Revision id.
   * @returns - New Promise
   */
  async get(id: number) {
    this.id = id;
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        if (entry) {
          this.export = entry.export;
          this.created_at = new Date(entry.created_at);
        }
        resolve();
      });
    });
  }

  /**
   * Create a new Structure.
   * @returns - New Promise
   */
  async create() {
    const data = {
      pia_id: this.pia_id,
      export: this.export,
      created_at: new Date()
    };
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        const formData = new FormData();
        for (const d in data) {
          if (data.hasOwnProperty(d)) {
            let value = data[d];
            if (d === 'data') {
              value = JSON.stringify(value);
            }
            formData.append('revision[' + d + ']', value);
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
            resolve({ ...result, id: result.id });
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
            resolve({ ...this, id: event.target.result });
          };
        });
      }
    });
  }
}
