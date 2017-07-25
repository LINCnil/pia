import { applicationDb } from "../../../application.db";

export class Measure extends applicationDb {
  public id: number;
  public pia_id: number;
  public title: string;
  public content: string;
  public created_at: Date;
  public updated_at: Date;

  constructor() {
    super(201707071818, 'measure');
  }

  async create() {
    if (this.created_at == undefined) {
      this.created_at = new Date();
    }
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      const created_at = new Date();
      this.objectStore.add({title: this.title, content: this.content,
        created_at: this.created_at, updated_at: new Date()
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
}
