import { applicationDb } from "../../../application.db";

export class Answer extends applicationDb {
  public id: number;
  public pia_id: number;
  public reference_to: string;
  public data: string;
  public created_at: Date;
  public updated_at: Date;

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
}
