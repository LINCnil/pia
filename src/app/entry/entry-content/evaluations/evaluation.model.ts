import { applicationDb } from "../../../application.db";

export class Card extends applicationDb {
  public id: number;
  public status: string;
  public reference_to: string;
  public action_plan_comment: string;
  public evaluation_comment: string;
  public evaluation_date: Date;
  public gauges: string;
  public estimated_evaluation_date: Date;
  public person_in_charge: string;
  public created_at: Date;
  public updated_at: Date;

  constructor() {
    super(201707071818, 'evaluation');
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
