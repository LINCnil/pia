import { ApplicationDb } from '../../../application.db';

export class Answer extends ApplicationDb {
  public id: number;
  public reference_to: string;
  public data: string;

  constructor() {
    super(201707071818, 'answer');
  }

  async create() {
    // await this.getObjectStore();
    // return new Promise((resolve, reject) => {
    //   this.objectStore.add({
    //     created_at: new Date(), updated_at: new Date()
    //   }).onsuccess = (event: any) => {
    //     resolve(event.target.result);
    //   };
    // });
  }

  async update() {
    // this.find(this.id).then((entry: any) => {
    //   entry.updated_at = new Date();
    //   this.objectStore.put(entry);
    // });
  }

  async get(id: number) {
    this.id = id;
    this.find(this.id).then((entry: any) => {
      this.pia_id = parseInt(entry.pia_id, 10);
      this.reference_to = entry.reference_to;
      this.data = entry.data;
      this.created_at = new Date(entry.created_at);
      this.updated_at = new Date(entry.updated_at);
    });
  }

  async findAll() {
    const items = [];
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      const index1 = this.objectStore.index('index1');
      index1.openCursor(IDBKeyRange.only([this.pia_id, this.reference_to])).onsuccess = (event: any) => {
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
