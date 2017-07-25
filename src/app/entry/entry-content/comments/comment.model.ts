import { ApplicationDb } from '../../../application.db';

export class Comment extends ApplicationDb {
  public id: number;
  public description: string;
  public reference_to: string;
  public type: string;
  public created_at: Date;
  public updated_at: Date;

  constructor() {
    super(201707071818, 'comment');
  }

  async create() {
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      const created_at = new Date();
      this.objectStore.add({description: this.description, reference_to: this.reference_to, type: this.type, created_at: created_at}).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async update(id) {
    this.find(id).then((entry: any) => {
      entry.description = this.description;
      entry.updated_at = new Date();
      this.objectStore.put(entry);
    });
  }

  async get(id: number) {
    this.id = id;
    this.find(this.id).then((entry: any) => {
      this.description = entry.description;
      this.reference_to = entry.reference_to;
      this.type = entry.type;
      this.created_at = new Date(entry.created_at);
      this.updated_at = new Date(entry.updated_at);
    });
  }
}
