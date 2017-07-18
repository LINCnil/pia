import { applicationDb } from "../../../application.db";

export class Measure extends applicationDb {
  public id: number;
  public pia_id: number;
  public title: string;
  public rank: number;
  public content: string;
  public created_at: Date;
  public updated_at: Date;

  constructor(id: number = null, title: string = null, content: string = null) {
    super(201707071818, 'measure');
    this.id = id;
    this.title = title;
    this.content = content;
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
