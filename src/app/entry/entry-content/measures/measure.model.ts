import { ApplicationDb } from '../../../application.db';

export class Measure extends ApplicationDb {
  public id: number;
  public title: string;
  public content: string;
  public placeholder: string;

  constructor() {
    super(201707071818, 'measure');
  }

  async create() {
    if (this.created_at === undefined) {
      this.created_at = new Date();
    }
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      const created_at = new Date();
      this.objectStore.add({title: this.title, content: this.content,
        placeholder: this.placeholder, created_at: this.created_at, updated_at: new Date()
      }).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async update(id) {
    this.find(id).then((entry: any) => {
      entry.title = this.title;
      entry.content = this.content;
      entry.updated_at = new Date();
      this.objectStore.put(entry);
    });
  }

  async get(id: number) {
    this.id = id;
    this.find(this.id).then((entry: any) => {
      this.pia_id = parseInt(entry.pia_id, 10);
      this.title = entry.title;
      this.content = entry.content;
      this.placeholder = entry.placeholder;
      this.created_at = new Date(entry.created_at);
      this.updated_at = new Date(entry.updated_at);
    });
  }

  async findAll() {
    const items = [];
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      const index1 = this.objectStore.index('index1');
      index1.openCursor(IDBKeyRange.only(this.pia_id)).onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          items.push(cursor.value);
          cursor.continue();
        }
        resolve(items);
      }
    });
  }
}
