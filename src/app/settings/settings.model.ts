import { ApplicationDb } from '../application.db';


export class Settings extends ApplicationDb {
  public id: number;
  public server_url: string;


  constructor() {
    super(201707071818, 'settings');
  }

  async create() {
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      this.objectStore.add({
        id: this.id,
        server_url: this.server_url
      }).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async update() {
    this.find(this.id).then((entry: any) => {
      entry.server_url = this.server_url;
      this.objectStore.put(entry);
    });
  }

  async get(id: number) {
    this.id = id;
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        this.server_url = entry.server_url;
        resolve();
      });
    });
  }

  async existEntry(id: number) {
    return new Promise((resolve, reject) => {
      this.find(id).then((entry: any) => {
        if (entry) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
}
