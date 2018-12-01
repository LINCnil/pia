import { ApplicationDb } from '../application.db';
import { resolve } from 'path';

export class Structure extends ApplicationDb {
  public id: number;
  public name: string;
  public sector_name: string;
  public data: { sections: any };
  public is_example = false;

  constructor() {
    super(201808011000, 'structure');
    this.created_at = new Date();
  }

  /**
   * Find all entries without conditions.
   * @returns {Promise}
   * @memberof Structure
   */
  async getAll() {
    const items = [];
    return new Promise((resolve, reject) => {
      this.findAll().then((entries: any) => {
        if (entries && entries.length > 0) {
          entries.forEach(element => {
            const newStructure = new Structure();
            newStructure.id = element.id;
            newStructure.name = element.name;
            newStructure.sector_name = element.sector_name;
            newStructure.data = element.data;
            newStructure.created_at = new Date(element.created_at);
            newStructure.updated_at = new Date(element.updated_at);
            items.push(newStructure);
          });
        }
        resolve(items);
      });
    });
  }

  /**
   * Create a new Structure.
   * @returns {Promise}
   * @memberof Structure
   */
  async create() {
    if (this.created_at === undefined) {
      this.created_at = new Date();
    }

    const data = {
      name: this.name,
      sector_name: this.sector_name,
      data: this.data,
      created_at: this.created_at,
      updated_at: this.updated_at
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
            formData.append('structure[' + d + ']', value);
          }
        }
        fetch(this.getServerUrl(), {
          method: 'POST',
          body: formData
        }).then((response) => {
          return response.json();
        }).then((result: any) => {
          resolve(result.id);
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
            resolve(event.target.result);
          };
        });
      }
    });
  }

  /**
   * Update a Structure.
   * @returns {Promise}
   * @memberof Structure
   */
  async update() {
    if (this.is_example) {
      return;
    }
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        entry.name = this.name;
        entry.sector_name = this.sector_name;
        entry.data = this.data;
        entry.updated_at = new Date();
        if (this.serverUrl) {
          const formData = new FormData();
          for (const d in entry) {
            if (entry.hasOwnProperty(d)) {
              let value = entry[d];
              if (d === 'data') {
                value = JSON.stringify(value);
              }
              formData.append('structure[' + d + ']', value);
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

  /**
   * Get a Structure.
   * @param {number} id - The Structure id.
   * @returns {Promise}
   * @memberof Structure
   */
  async get(id: number) {
    this.id = id;
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        if (entry) {
          this.name = entry.name;
          this.sector_name = entry.sector_name;
          this.data = entry.data;
          this.created_at = new Date(entry.created_at);
          this.updated_at = new Date(entry.updated_at);
        }
        resolve();
      });
    });
  }
}
