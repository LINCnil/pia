import { ApplicationDb } from '../../../application.db';

export class Evaluation extends ApplicationDb {
  public id: number;
  public status = 0; // 0: pending, 1: toBeFixed, 2: improvable, 3: acceptable
  public action_plan_comment: string;
  public evaluation_comment: string;
  public evaluation_date: Date;
  public gauges: {x: number, y: number};
  public estimated_implementation_date: Date;
  public person_in_charge: string;
  public global_status = 0; // 0: No evaluation, 1: Evaluation started, 2: Evaluation completed

  constructor() {
    super(201707071818, 'evaluation');
  }

  async create() {
    const data = {
          status: this.status,
          pia_id: this.pia_id,
          reference_to: this.reference_to,
          action_plan_comment: this.action_plan_comment,
          evaluation_comment: this.evaluation_comment,
          evaluation_date: this.evaluation_date,
          gauges: this.gauges,
          estimated_implementation_date: new Date(this.estimated_implementation_date),
          person_in_charge: this.person_in_charge,
          global_status: this.global_status,
          created_at: new Date()
        };
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl(), {
          method: 'POST',
          body: this.setFormData(data)
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
        entry.status = this.status;
        entry.reference_to = this.reference_to;
        entry.action_plan_comment = this.action_plan_comment;
        entry.evaluation_comment = this.evaluation_comment;
        entry.evaluation_date = this.evaluation_date;
        entry.gauges = this.gauges;
        entry.estimated_implementation_date = new Date(this.estimated_implementation_date);
        entry.person_in_charge = this.person_in_charge;
        entry.global_status = this.global_status;
        entry.updated_at = new Date();
        if (this.serverUrl) {
          fetch(this.getServerUrl() + '/' + this.id, {
            method: 'PATCH',
            body: this.setFormData(entry)
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
      if (data.hasOwnProperty(d) && data[d]) {
        if (d === 'gauges') {
          for (const dd in data[d]) {
            if (data[d].hasOwnProperty(dd) && data[d][dd]) {
              formData.append('evaluation[' + d + '][' + dd + ']', data[d][dd]);
            }
          }
        } else {
          formData.append('evaluation[' + d + ']', data[d]);
        }
      }
    }
    return formData;
  }

  /* Get an evaluation for a specific question or a specific measure */
  async getByReference(pia_id: number, reference_to: any) {
    this.pia_id = pia_id;
    if (this.pia_id) {
      this.reference_to = reference_to;
      return new Promise((resolve, reject) => {
        if (this.serverUrl) {
          fetch(this.getServerUrl() + '?reference_to=' + this.reference_to).then((response) => {
            return response.json();
          }).then((result: any) => {
            if (result) {
              this.id = result.id;
              this.status = result.status;
              this.pia_id = parseInt(result.pia_id, 10);
              this.reference_to = result.reference_to;
              this.action_plan_comment = result.action_plan_comment;
              this.evaluation_comment = result.evaluation_comment;
              this.evaluation_date = result.evaluation_date;
              this.gauges = result.gauges;
              this.estimated_implementation_date = new Date(result.estimated_implementation_date);
              this.person_in_charge = result.person_in_charge;
              this.global_status = result.global_status;
              this.created_at = new Date(result.created_at);
              this.updated_at = new Date(result.updated_at);
              resolve(this);
            } else {
              resolve(false);
            }
          }).catch((error) => {
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
                this.status = entry.status;
                this.pia_id = parseInt(entry.pia_id, 10);
                this.reference_to = entry.reference_to;
                this.action_plan_comment = entry.action_plan_comment;
                this.evaluation_comment = entry.evaluation_comment;
                this.evaluation_date = entry.evaluation_date;
                this.gauges = entry.gauges;
                this.estimated_implementation_date = new Date(entry.estimated_implementation_date);
                this.person_in_charge = entry.person_in_charge;
                this.global_status = entry.global_status;
                this.created_at = new Date(entry.created_at);
                this.updated_at = new Date(entry.updated_at);
                resolve(this);
              } else {
                resolve(false);
              }
            }
          });
        }
      });
    }
  }

  async get(id: number) {
    this.id = id;
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        this.id = entry.id;
        this.status = entry.status;
        this.pia_id = parseInt(entry.pia_id, 10);
        this.reference_to = entry.reference_to;
        this.action_plan_comment = entry.action_plan_comment;
        this.evaluation_comment = entry.evaluation_comment;
        this.evaluation_date = entry.evaluation_date;
        this.gauges = entry.gauges;
        this.estimated_implementation_date = new Date(entry.estimated_implementation_date);
        this.person_in_charge = entry.person_in_charge;
        this.global_status = entry.global_status;
        this.created_at = new Date(entry.created_at);
        this.updated_at = new Date(entry.updated_at);
        resolve(this);
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

  async existByReference(pia_id: number, reference_to: any) {
    this.pia_id = pia_id;
    this.reference_to = reference_to;
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl() + '?reference_to=' + this.reference_to).then((response) => {
          return response.json();
        }).then((result: any) => {
          if (result && result.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }).catch((error) => {
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
              resolve(true);
            } else {
              resolve(false);
            }
          }
        });
      }
    });
  }

  async globalStatusByReference(pia_id: number, reference_to: any, global_status: number) {
    this.pia_id = pia_id;
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        fetch(this.getServerUrl() + '?reference_to=' + reference_to).then((response) => {
          return response.json();
        }).then((result: any) => {
          if (result) {
            resolve((result.global_status === global_status));
          } else {
            resolve(false);
          }
        }).catch((error) => {
          console.error('Request failed', error);
          reject();
        });
      } else {
        this.getObjectStore().then(() => {
          const index1 = this.objectStore.index('index1');
          const evt = index1.get(IDBKeyRange.only([this.pia_id, reference_to]));
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          }
          evt.onsuccess = (event: any) => {
            const entry = event.target.result;
            if (entry) {
              resolve((entry.global_status === global_status));
            } else {
              resolve(false);
            }
          }
        });
      }
    });
  }

  getStatusName() {
    return 'evaluations.status.' + this.status;
  }
}
