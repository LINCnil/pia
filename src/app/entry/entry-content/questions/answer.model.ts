import { ApplicationDb } from '../../../application.db';

export class Answer extends ApplicationDb {
  public id: number;
  public data: { text: string, gauge: number, list: string[] };

  constructor() {
    super(201707071818, 'answer');
  }

  async create() {
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      this.objectStore.add({
        pia_id: this.pia_id,
        reference_to: this.reference_to,
        data: this.data,
        created_at: new Date()
      }).onsuccess = (event: any) => {
        this.id = event.target.result;
        resolve();
      };
    });
  }

  async update() {
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        entry.data = this.data;
        entry.updated_at = new Date();
        this.objectStore.put(entry).onsuccess = () => {
          resolve();
        };
      });
    });
  }

  async get(id: number) {
    this.id = id;
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        this.pia_id = parseInt(entry.pia_id, 10);
        this.reference_to = entry.reference_to;
        this.data = entry.data;
        this.created_at = new Date(entry.created_at);
        this.updated_at = new Date(entry.updated_at);
        resolve();
      });
    });
  }

  async getByReferenceAndPia(pia_id: number, reference_to: any) {
    this.pia_id = pia_id;
    this.reference_to = reference_to;
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      const index1 = this.objectStore.index('index1');
      index1.get(IDBKeyRange.only([this.pia_id, this.reference_to])).onsuccess = (event: any) => {
        const entry = event.target.result;
        if (entry) {
          this.id = entry.id;
          this.reference_to = entry.reference_to;
          this.data = entry.data;
          this.created_at = new Date(entry.created_at);
          this.updated_at = new Date(entry.updated_at);
        }
        resolve();
      }
    });
  }

  async findAllByPia(pia_id: number) {
    const items = [];
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      const index1 = this.objectStore.index('index2');
      index1.openCursor(IDBKeyRange.only(pia_id)).onsuccess = (event: any) => {
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

  async getGaugeByPia(pia_id: number) {
    const items = [];
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      const index2 = this.objectStore.index('index2');
      index2.openCursor(IDBKeyRange.only(pia_id)).onsuccess = (event: any) => {
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
}
