// import { piaDb } from '../db';
// import { AngularIndexedDB } from 'angular2-indexeddb';

export class Card {
  public id: number;
  public status: number;
  public name: string;
  public author_name: string;
  public evaluator_name: string;
  public validator_name: string;
  public dpo_status: number;
  public dpo_opinion: string;
  public concerned_people_opinion: string;
  public concerned_people_status: string;
  public rejected_reason: string;
  public applied_adjustements: string;
  public creation_date: Date;
  public last_open_date: Date;
  private piaDb: any;

  constructor(name = null, author_name = null, evaluator_name = null, validator_name = null) {
    this.name = name;
    this.author_name = author_name;
    this.evaluator_name = evaluator_name;
    this.validator_name = validator_name;
    this.creation_date = new Date();
    this.piaDb = null;
  }

  initDb() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open("pia", 201707071818);
      request.onerror = (event: any) => {
        console.error('Error');
      };
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
      request.onupgradeneeded = (event: any) => {
        const objectStore = event.target.result.createObjectStore("pia", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("status", "status", { unique: false });
      };
    });
  }

  async getAll() {
    this.piaDb = await this.initDb();
    return new Promise((resolve, reject) => {
      const pia: any = this.piaDb.transaction("pia", "readwrite").objectStore("pia");
      pia.getAll().onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }

  async save() {
    this.piaDb = await this.initDb();
    return new Promise((resolve, reject) => {
      const pia: IDBObjectStore = this.piaDb.transaction("pia", "readwrite").objectStore("pia");
      pia.add({
        name: this.name, author_name: this.author_name,
        evaluator_name: this.evaluator_name, validator_name: this.validator_name,
        creation_date: this.creation_date, last_open_date: new Date(), status: 1
      }).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async delete(id) {
    this.piaDb = await this.initDb();
    return new Promise((resolve, reject) => {
      const pia: IDBObjectStore = this.piaDb.transaction("pia", "readwrite").objectStore("pia");
      pia.delete(id);
    });
  }
}
