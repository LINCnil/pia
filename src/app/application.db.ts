import { NavigationEnd } from '@angular/router';
import { ApiService } from './services/api.service';

export class ApplicationDb {
  protected apiService: ApiService;

  protected serverUrl: string;
  public pia_id: number;
  public structure_id: number;
  public knowledge_base_id: number;
  public reference_to: string;
  public created_at: Date;
  public updated_at: Date;
  protected dbVersion: number;
  protected tableName: string;
  protected objectStore: IDBObjectStore;

  constructor(dbVersion: number, tableName: string) {
    this.dbVersion = dbVersion;
    this.tableName = tableName;

    // if (localStorage.getItem('server_url')) {
    //   this.serverUrl = localStorage.getItem('server_url');
    // } else {
    //   this.serverUrl = null;
    // }

    if (window.location.hash && window.location.hash.split('/')[2]) {
      switch (window.location.hash.split('/')[1]) {
        case 'pia':
          this.pia_id = parseInt(window.location.hash.split('/')[2], 10);
          break;
        case 'structures':
          this.structure_id = parseInt(window.location.hash.split('/')[2], 10);
          break;
        case 'knowledge_bases':
          this.knowledge_base_id = parseInt(
            window.location.hash.split('/')[2],
            10
          );
          break;
        default:
          break;
      }
    }
  }

  prepareApi(apiService: ApiService) {
    this.apiService = apiService;
  }

  /**
   * Initialize database.
   * @returns {Promise}
   */
  async initDb() {
    return new Promise((resolve, reject) => {
      const evt = window.indexedDB.open(this.tableName, this.dbVersion);
      evt.onerror = (event: any) => {
        // Hack to return the previous database if the current version is bigger than the previous one.
        const evt2 = window.indexedDB.open(this.tableName);
        evt2.onsuccess = (event2: any) => {
          resolve(event2.target.result);
        };
        evt2.onerror = (event2: any) => {
          console.error(event2);
          reject(Error(event2));
        };
      };
      evt.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
      evt.onupgradeneeded = (event: any) => {
        let objectStore = null;
        if (event.oldVersion !== 0) {
          objectStore = event.target.transaction.objectStore(this.tableName);
        } else {
          objectStore = event.target.result.createObjectStore(this.tableName, {
            keyPath: 'id',
            autoIncrement: true
          });
        }
        if (objectStore) {
          if (event.oldVersion === 0) {
            // First DB init
            if (this.tableName === 'pia') {
              objectStore.createIndex('index1', 'status', { unique: false });
            } else if (this.tableName === 'comment') {
              objectStore.createIndex('index1', ['pia_id', 'reference_to'], {
                unique: false
              });
            } else if (this.tableName === 'evaluation') {
              objectStore.createIndex('index1', ['pia_id', 'reference_to'], {
                unique: false
              });
              objectStore.createIndex('index2', 'pia_id', { unique: false });
            } else if (this.tableName === 'answer') {
              objectStore.createIndex('index1', ['pia_id', 'reference_to'], {
                unique: false
              });
              objectStore.createIndex('index2', 'pia_id', { unique: false });
            } else if (this.tableName === 'measure') {
              objectStore.createIndex('index1', 'pia_id', { unique: false });
            } else if (this.tableName === 'attachment') {
              objectStore.createIndex('index1', 'pia_id', { unique: false });
            } else if (this.tableName === 'revision') {
              objectStore.createIndex('index1', 'pia_id', { unique: false });
            } else if (this.tableName === 'knowledge') {
              objectStore.createIndex('index1', 'knowledge_base_id', {
                unique: false
              });
            }
          }
          if (event.oldVersion !== this.dbVersion) {
            // Next DB versions
            if (this.dbVersion === 201708291502 || event.oldVersion === 0) {
              if (this.tableName === 'attachment') {
                objectStore.createIndex('index2', ['pia_id', 'pia_signed'], {
                  unique: false
                });
              }
            }
            if (this.dbVersion === 201709122303 || event.oldVersion === 0) {
              if (this.tableName === 'comment') {
                objectStore.createIndex('index2', 'pia_id', { unique: false });
              }
            }
            if (this.dbVersion === 201802221337 || event.oldVersion === 0) {
              if (this.tableName === 'pia') {
                objectStore.createIndex('index3', 'is_example', {
                  unique: false
                });
              }
            }
            if (this.dbVersion === 201809012140 || event.oldVersion === 0) {
              if (this.tableName === 'pia') {
                objectStore.createIndex('index4', 'structure_id', {
                  unique: false
                });
              }
            }
            if (this.dbVersion === 201910230914 || event.oldVersion === 0) {
              if (this.tableName === 'pia') {
                objectStore.createIndex('index5', 'is_archive', {
                  unique: false
                });
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
   */
  async getObjectStore(): Promise<any> {
    const db: any = await this.initDb();
    db.onversionchange = () => {
      db.close();
      alert('A new version of this page is ready. Please reload!');
    };
    return new Promise((resolve, reject) => {
      this.objectStore = db
        .transaction(this.tableName, 'readwrite')
        .objectStore(this.tableName);
      if (this.objectStore) {
        resolve(this.objectStore);
      } else {
        reject(false);
      }
    });
  }

  /**
   * Find all entries without conditions.
   * Many result items (cursor for indexedDb)
   * @returns {Promise}
   */
  async findAll(urlParams?: string, withIndex?: { index: string; value: any }) {
    const items = [];
    return new Promise((resolve, reject) => {
      if (this.apiService && this.apiService.base) {
        this.apiService
          .get(this.getServerUrl() + (urlParams ? urlParams : ''))
          .then((result: any) => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } else {
        // console.log(this.getServerUrl(), 'indexdb');
        this.getObjectStore().then(() => {
          let evt;
          let index1;
          if (withIndex) {
            index1 = this.objectStore.index(withIndex.index);
            evt = index1.openCursor(IDBKeyRange.only(withIndex.value));
          } else {
            evt = this.objectStore.openCursor();
          }

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
   * Default find method for an entry in the database.
   * Only One Result
   * @param {any} id - The record id.
   */
  async find(id: number | string) {
    return new Promise((resolve, reject) => {
      if (id) {
        if (this.apiService && this.apiService.base) {
          this.apiService
            .get(this.getServerUrl() + '/' + id)
            .then((result: any) => {
              resolve(result);
            })
            .catch(error => {
              reject(error);
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
      } else {
        reject(new Error('No Id selected'));
      }
    });
  }

  /**
   *
   * get for index db
   */
  async findWithReference(
    urlParams?: string,
    withIndex?: { index: string; value: any }
  ) {
    return new Promise((resolve, reject) => {
      if (this.apiService && this.apiService.base) {
        this.apiService
          .get(this.getServerUrl() + urlParams)
          .then((result: any) => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } else {
        this.getObjectStore().then(() => {
          const index1 = this.objectStore.index(withIndex.index);
          const evt = index1.get(IDBKeyRange.only(withIndex.value));
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

  async create(data: any | FormData, prefix?: string, preformated?: FormData) {
    return new Promise((resolve, reject) => {
      if (this.apiService && this.apiService.base) {
        let formData = new FormData();
        if (!preformated) {
          for (const d in data) {
            if (data.hasOwnProperty(d)) {
              let value = data[d];

              if (
                d === 'data' ||
                d === 'structure_data' ||
                d === 'items' ||
                d === 'access_type'
              ) {
                // Structure.data
                value = JSON.stringify(value);
              }

              formData.append(
                `${prefix ? prefix : 'pia'}[${d}]`,
                value !== null ? value : ''
              );
            }
          }
        } else {
          formData = preformated;
        }

        this.apiService
          .post(this.getServerUrl(), formData)
          .then((result: any) => {
            resolve(result);
          })
          .catch(error => {
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
            // TODO: retrun the entire object
            resolve({ ...data, id: event.target.result });
          };
        });
      }
    });
  }

  async update(id: any, entry: any, prefix?: string, preformated?: FormData) {
    return new Promise((resolve, reject) => {
      if (this.apiService && this.apiService.base) {
        let formData = new FormData();
        if (!preformated) {
          for (const d in entry) {
            if (entry.hasOwnProperty(d)) {
              let value = entry[d];
              if (
                d === 'data' ||
                d === 'structure_data' ||
                d === 'items' ||
                d === 'access_type'
              ) {
                // Structure.data
                value = JSON.stringify(value);
              }

              formData.append(
                `${prefix ? prefix : 'pia'}[${d}]`,
                value !== null ? value : ''
              );
            }
          }
        } else {
          formData = preformated;
        }

        this.apiService
          .patch(this.getServerUrl() + '/' + id, formData)
          .then((result: any) => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } else {
        this.getObjectStore().then(() => {
          const evt = this.objectStore.put(entry);
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            // Return object data after update
            const evtF = this.objectStore.get(id);
            evtF.onsuccess = (eventF: any) => {
              resolve(eventF.target.result);
            };
          };
        });
      }
    });
  }

  /**
   * Default delete method for an entry in the database.
   * @param {any} id - The record id.
   * @returns {Promise}
   */
  async delete(id) {
    return new Promise((resolve, reject) => {
      if (this.apiService && this.apiService.base) {
        this.apiService
          .delete(this.getServerUrl() + '/' + id)
          .then((result: any) => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } else {
        this.getObjectStore().then(() => {
          const evt = this.objectStore.delete(id);
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            resolve(event.target);
          };
        });
      }
    });
  }

  /**
   * Return the server URL.
   * @public
   * @returns {string} - An URL.
   */
  public getServerUrl(): string {
    let prefix = '/pias';
    let id = this.pia_id;

    if (this.tableName === 'structure') {
      prefix = '/structures';
      id = this.structure_id;
    }

    if (this.tableName === 'knowledgeBase') {
      prefix = '/knowledge_bases';
    }

    if (this.tableName === 'knowledge') {
      prefix = '/knowledge_bases';
      id = this.knowledge_base_id;
    }

    if (this.tableName === 'user') {
      prefix = '/users';
    }

    if (
      this.tableName !== 'pia' &&
      this.tableName !== 'structure' &&
      this.tableName !== 'knowledgeBase' &&
      this.tableName !== 'user'
    ) {
      return prefix + '/' + id + '/' + this.tableName + 's';
    } else {
      return prefix;
    }
  }

  public prepareServerUrl(router): void {
    if (router) {
      router.events.subscribe(evt => {
        if (evt instanceof NavigationEnd) {
          if (evt.url && evt.url.split('/')[2]) {
            switch (evt.url.split('/')[1]) {
              case 'pia':
                this.pia_id = parseInt(evt.url.split('/')[2], 10);
                break;
              case 'structures':
                this.structure_id = parseInt(evt.url.split('/')[2], 10);
                break;
              case 'knowledge_bases':
                this.knowledge_base_id = parseInt(evt.url.split('/')[2], 10);
                break;
              default:
                break;
            }
          }
        }
      });
    }
  }
}
