export class ApplicationDb {
  protected serverUrl: string;
  public pia_id: number;
  public structure_id: number;
  public reference_to: string;
  public created_at: Date;
  public updated_at: Date;
  protected dbVersion: number;
  protected tableName: string;
  protected objectStore: IDBObjectStore;

  constructor(dbVersion: number, tableName: string) {
    this.dbVersion = dbVersion;
    this.tableName = tableName;
    if (localStorage.getItem('server_url')) {
      this.serverUrl = localStorage.getItem('server_url');
    } else {
      this.serverUrl = null;
    }
  }

  /**
   * Initialize database.
   * @returns {Promise}
   * @memberof ApplicationDb
   */
  async initDb() {
    return new Promise((resolve, reject) => {
      const evt = window.indexedDB.open(this.tableName, this.dbVersion);
      evt.onerror = (event: any) => {
        console.error(event);
        reject(Error(event));
      };
      evt.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
      evt.onupgradeneeded = (event: any) => {
        let objectStore = null;
        if (event.oldVersion !== 0) {
          objectStore =  event.target.transaction.objectStore(this.tableName);
        } else {
          objectStore = event.target.result.createObjectStore(this.tableName, { keyPath: 'id', autoIncrement: true });
        }
        if (objectStore) {
          if (event.oldVersion === 0) {
            // First DB init
            if (this.tableName === 'pia') {
              objectStore.createIndex('index1', 'status', { unique: false });
            } else if (this.tableName === 'comment') {
              objectStore.createIndex('index1', ['pia_id', 'reference_to'], { unique: false });
            } else if (this.tableName === 'evaluation') {
              objectStore.createIndex('index1', ['pia_id', 'reference_to'], { unique: false });
              objectStore.createIndex('index2', 'pia_id', { unique: false });
            } else if (this.tableName === 'answer') {
              objectStore.createIndex('index1', ['pia_id', 'reference_to'], { unique: false });
              objectStore.createIndex('index2', 'pia_id', { unique: false });
            } else if (this.tableName === 'measure') {
              objectStore.createIndex('index1', 'pia_id', { unique: false });
            } else if (this.tableName === 'attachment') {
              objectStore.createIndex('index1', 'pia_id', { unique: false });
            }
          }
          if (event.oldVersion !== this.dbVersion) {
            // Next DB versions
            if (this.dbVersion === 201708291502 || event.oldVersion === 0) {
              if (this.tableName === 'attachment') {
                objectStore.createIndex('index2', ['pia_id', 'pia_signed'], { unique: false });
              }
            }
            if (this.dbVersion === 201709122303 || event.oldVersion === 0) {
              if (this.tableName === 'comment') {
                objectStore.createIndex('index2', 'pia_id', { unique: false });
              }
            }
            if (this.dbVersion === 201802221337 || event.oldVersion === 0) {
              if (this.tableName === 'pia') {
                objectStore.createIndex('index3', 'is_example', { unique: false });
              }
            }
            if (this.dbVersion === 201809012140 || event.oldVersion === 0) {
              if (this.tableName === 'pia') {
                objectStore.createIndex('index4', 'structure_id', { unique: false });
              }
            }
          }
        }
      };
    });
  }

  /**
   * Get the database object.
   * @returns {Promise}
   * @memberof ApplicationDb
   */
  async getObjectStore() {
    const db: any = await this.initDb();
    db.onversionchange = function(event) {
      db.close();
      alert('A new version of this page is ready. Please reload!');
    };
    return new Promise((resolve, reject) => {
      this.objectStore = db.transaction(this.tableName, 'readwrite').objectStore(this.tableName);
      resolve();
    });
  }

  /**
   * Find all entries without conditions.
   * @returns {Promise}
   * @memberof ApplicationDb
   */
  async findAll() {
    const items = [];
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
        this.getObjectStore().then(() => {
          const evt = this.objectStore.openCursor();
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
          }
        });
      }
    });
  }

  /**
   * Default find method for an entry in the database.
   * @param {any} id - The record id.
   * @returns {Promise}
   * @memberof ApplicationDb
   */
  async find(id) {
    if (id) {
      return new Promise((resolve, reject) => {
        if (this.serverUrl) {
          fetch(this.getServerUrl() + '/' + id).then(function(response) {
            return response.json();
          }).then(function(result: any) {
            resolve(result);
          }).catch (function (error) {
            console.error('Request failed', error);
            reject();
          });
        } else {
          this.getObjectStore().then(() => {
            const evt = this.objectStore.get(id);
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
  }

  /**
   * Default delete method for an entry in the database.
   * @param {any} id - The record id.
   * @returns {Promise}
   * @memberof ApplicationDb
   */
  async delete(id) {
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl() + '/' + id, {
          method: 'DELETE'
        }).then(function(response) {
          return response;
        }).then(function(item) {
          resolve();
        }).catch (function (error) {
          console.error('Request failed', error);
          reject();
        });
      } else {
        this.getObjectStore().then(() => {
          const evt = this.objectStore.delete(id);
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            resolve();
          };
        });
      }
    });
  }

  /**
   * Return the server URL.
   * @protected
   * @returns {string} - An URL.
   * @memberof ApplicationDb
   */
  protected getServerUrl() {
    let prefix = '/pias';
    let id = this.pia_id;
    if (this.tableName === 'structure') {
      prefix = '/structures';
      id = this.structure_id;
    }

    if (this.tableName !== 'pia' && this.tableName !== 'structure') {
      return this.serverUrl + prefix + '/' + id + '/' + this.tableName + 's' ;
    } else {
      return this.serverUrl + prefix;
    }
  }
}
