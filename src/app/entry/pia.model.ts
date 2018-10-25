import { ApplicationDb } from '../application.db';
import { Answer } from 'app/entry/entry-content/questions/answer.model';

export class Pia extends ApplicationDb {
  public id: number;
  public status = 0; // 0: doing, 1: refused, 2: simple_validation, 3: signed_validation, 4: archived
  public name: string;
  public author_name: string;
  public evaluator_name: string;
  public validator_name: string;
  public dpo_status: number; // 0: NOK, 1: OK
  public dpo_opinion: string;
  public concerned_people_opinion: string;
  public concerned_people_status: number; // 0: NOK, 1: OK
  public concerned_people_searched_opinion: boolean; // 0 : false, 1: true
  public concerned_people_searched_content: string;
  public rejected_reason: string;
  public applied_adjustements: string;
  public dpos_names: string;
  public people_names: string;
  public progress: number;
  public is_example = 0;
  public structure_id: number;
  public structure_name: string;
  public structure_sector_name: string;
  public structure_data: { sections: any };

  constructor() {
    super(201809012140, 'pia');
    this.created_at = new Date();
  }

  /**
   * Find all entries without conditions.
   * @returns {Promise}
   * @memberof Pia
   */
  async getAll() {
    const items = [];
    return new Promise((resolve, reject) => {
      this.findAll().then((entries: any) => {
        if (entries && entries.length > 0) {
          entries.forEach(element => {
            if (element.is_example === 1) {
              return;
            }
            const newPia = new Pia();
            newPia.id = element.id;
            newPia.name = element.name;
            newPia.author_name = element.author_name;
            newPia.evaluator_name = element.evaluator_name;
            newPia.validator_name = element.validator_name;
            newPia.dpo_status = element.dpo_status;
            newPia.dpo_opinion = element.dpo_opinion;
            newPia.concerned_people_opinion = element.concerned_people_opinion;
            newPia.concerned_people_status = element.concerned_people_status;
            newPia.rejected_reason = element.rejected_reason;
            newPia.applied_adjustements = element.applied_adjustements;
            newPia.status = element.status;
            newPia.dpos_names = element.dpos_names;
            newPia.people_names = element.people_names;
            newPia.concerned_people_searched_opinion = element.concerned_people_searched_opinion;
            newPia.concerned_people_searched_content = element.concerned_people_searched_content;
            newPia.is_example = element.is_example;
            newPia.structure_id = element.structure_id;
            newPia.structure_name = element.structure_name;
            newPia.structure_sector_name = element.structure_sector_name;
            newPia.structure_data = element.structure_data;
            newPia.created_at = new Date(element.created_at);
            newPia.updated_at = new Date(element.updated_at);
            items.push(newPia);
          });
        }
        resolve(items);
      });
    });
  }

  async getAllWithStructure(structure_id: number) {
    const items = [];
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
          const index4 = this.objectStore.index('index4');
          const evt = index4.openCursor(IDBKeyRange.only(structure_id));
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

  /**
   * Create a new PIA.
   * @returns {Promise}
   * @memberof Pia
   */
  async create() {
    if (this.created_at === undefined) {
      this.created_at = new Date();
    }

    const data = {
      name: this.name,
      author_name: this.author_name,
      evaluator_name: this.evaluator_name,
      validator_name: this.validator_name,
      dpo_status: this.dpo_status,
      dpo_opinion: this.dpo_opinion,
      concerned_people_opinion: this.concerned_people_opinion,
      concerned_people_status: this.concerned_people_status,
      rejected_reason: this.rejected_reason,
      applied_adjustements: this.applied_adjustements,
      created_at: this.created_at,
      updated_at: this.updated_at,
      status: this.status,
      is_example: this.is_example,
      dpos_names: this.dpos_names,
      people_names: this.people_names,
      concerned_people_searched_opinion: this.concerned_people_searched_opinion,
      concerned_people_searched_content: this.concerned_people_searched_content,
      structure_id: (this.structure_id ? this.structure_id : ''),
      structure_name: this.structure_name,
      structure_sector_name: this.structure_sector_name,
      structure_data: (this.structure_data ? this.structure_data : '')
    };

    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        const formData = new FormData();
        for (const d in data) {
          if (data.hasOwnProperty(d)) {
            let value = data[d];
            if (d === 'structure_data') {
              value = JSON.stringify(value);
            }
            formData.append('pia[' + d + ']', value);
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
   * Update a PIA.
   * @returns {Promise}
   * @memberof Pia
   */
  async update() {
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        entry.name = this.name;
        entry.author_name = this.author_name;
        entry.evaluator_name = this.evaluator_name;
        entry.validator_name = this.validator_name;
        entry.dpo_status = this.dpo_status;
        entry.dpo_opinion = this.dpo_opinion;
        entry.concerned_people_opinion = this.concerned_people_opinion;
        entry.concerned_people_status = this.concerned_people_status;
        entry.rejected_reason = this.rejected_reason;
        entry.applied_adjustements = this.applied_adjustements;
        entry.status = this.status;
        entry.is_example = this.is_example;
        entry.dpos_names = this.dpos_names;
        entry.people_names = this.people_names;
        entry.concerned_people_searched_opinion = this.concerned_people_searched_opinion;
        entry.concerned_people_searched_content = this.concerned_people_searched_content;
        entry.structure_id = (this.structure_id ? this.structure_id : '');
        entry.structure_name = this.structure_name;
        entry.structure_sector_name = this.structure_sector_name;
        entry.structure_data = (this.structure_data ? this.structure_data : '')
        entry.updated_at = new Date();
        if (this.serverUrl) {
          const formData = new FormData();
          for (const d in entry) {
            if (entry.hasOwnProperty(d)) {
              let value = entry[d];
              if (d === 'structure_data') {
                value = JSON.stringify(value);
              }
              formData.append('pia[' + d + ']', value);
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
   * Update a PIA.
   * @returns {Promise}
   * @memberof Pia
   */
  async updateEntry(entry: any) {
    return new Promise((resolve, reject) => {
      entry.updated_at = new Date();
      if (this.serverUrl) {
        const formData = new FormData();
        for (const d in entry) {
          if (entry.hasOwnProperty(d)) {
            let value = entry[d];
            if (d === 'structure_data') {
              value = JSON.stringify(value);
            }
            formData.append('pia[' + d + ']', value);
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
  }

  /**
   * Get a PIA.
   * @param {number} id - The PIA id.
   * @returns {Promise}
   * @memberof Pia
   */
  async get(id: number) {
    this.id = id;
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        if (entry) {
          this.status = entry.status;
          this.is_example = entry.is_example;
          this.name = entry.name;
          this.author_name = entry.author_name;
          this.evaluator_name = entry.evaluator_name;
          this.validator_name = entry.validator_name;
          this.dpo_status = entry.dpo_status;
          this.dpo_opinion = entry.dpo_opinion;
          this.concerned_people_opinion = entry.concerned_people_opinion;
          this.concerned_people_status = entry.concerned_people_status;
          this.rejected_reason = entry.rejected_reason;
          this.applied_adjustements = entry.applied_adjustements;
          this.created_at = new Date(entry.created_at);
          this.updated_at = new Date(entry.updated_at);
          this.dpos_names = entry.dpos_names;
          this.people_names = entry.people_names;
          this.concerned_people_searched_opinion = entry.concerned_people_searched_opinion;
          this.concerned_people_searched_content = entry.concerned_people_searched_content;
          this.structure_id = entry.structure_id;
          this.structure_name = entry.structure_name;
          this.structure_sector_name = entry.structure_sector_name;
          this.structure_data = entry.structure_data;
        }
        resolve();
      });
    });
  }

  /**
   * Get the PIA example.
   * @returns {Promise}
   * @memberof Pia
   */
  async getPiaExample() {
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl() + '/' + 'example').then((response) => {
          return response.json();
        }).then((result: any) => {
          resolve(result);
        }).catch((error) => {
          console.error('Request failed', error);
          reject();
        });
      } else {
        this.getObjectStore().then(() => {
          const index3 = this.objectStore.index('index3');
          const evt = index3.get(IDBKeyRange.only(1));
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          }
          evt.onsuccess = (event: any) => {
              const entry = event.target.result;
              if (entry) {
                this.id = entry.id;
                this.status = entry.status;
                this.is_example = entry.is_example;
                this.name = entry.name;
                this.author_name = entry.author_name;
                this.evaluator_name = entry.evaluator_name;
                this.validator_name = entry.validator_name;
                this.dpo_status = entry.dpo_status;
                this.dpo_opinion = entry.dpo_opinion;
                this.concerned_people_opinion = entry.concerned_people_opinion;
                this.concerned_people_status = entry.concerned_people_status;
                this.rejected_reason = entry.rejected_reason;
                this.applied_adjustements = entry.applied_adjustements;
                this.created_at = new Date(entry.created_at);
                this.updated_at = new Date(entry.updated_at);
                this.dpos_names = entry.dpos_names;
                this.people_names = entry.people_names;
                this.concerned_people_searched_opinion = entry.concerned_people_searched_opinion;
                this.concerned_people_searched_content = entry.concerned_people_searched_content;
                this.structure_id = entry.structure_id;
                this.structure_name = entry.structure_name;
                this.structure_sector_name = entry.structure_sector_name;
                this.structure_data = entry.structure_data;
                resolve(entry);
              } else {
                resolve(false);
              }
            }
        });
      }
    });
  }

  /**
   * Get the status of the PIA.
   * @returns {string} - Locale for translation.
   * @memberof Pia
   */
  getStatusName() {
    if (this.status >= 0) {
      return `pia.statuses.${this.status}`;
    }
  }

  /**
   * Get people status.
   * @param {boolean} status - The people search status.
   * @returns {string} - Locale for translation.
   * @memberof Pia
   */
  getPeopleSearchStatus(status: boolean) {
    if (status === true) {
      return 'summary.people_search_status_ok';
    } else {
      return 'summary.people_search_status_nok';
    }
  }

  /**
   * Get opinion status.
   * @param {string} status - The opinion status.
   * @returns {string} - Locale for translation.
   * @memberof Pia
   */
  getOpinionsStatus(status: string) {
    if (status) {
      return `summary.content_choice.${status}`;
    }
  }

  /**
   * Get gauge name.
   * @param {*} value - The gauge value.
   * @returns {string} - Locale for translation.
   * @memberof Pia
   */
  getGaugeName(value: any) {
    if (value) {
      return `summary.gauges.${value}`;
    }
  }
}



