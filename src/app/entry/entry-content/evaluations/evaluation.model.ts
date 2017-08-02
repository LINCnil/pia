import { ApplicationDb } from '../../../application.db';

export class Evaluation extends ApplicationDb {
  public id: number;
  public status: string;
  public reference_to: string;
  public action_plan_comment: string;
  public evaluation_comment: string;
  public evaluation_date: Date;
  public gauges: string;
  public estimated_evaluation_date: Date;
  public person_in_charge: string;

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

  async get(id: number) {
    this.id = id;
    this.find(this.id).then((entry: any) => {
      this.pia_id = parseInt(entry.pia_id, 10);
      this.status = entry.status;
      this.reference_to = entry.reference_to;
      this.action_plan_comment = entry.action_plan_comment;
      this.evaluation_comment = entry.evaluation_comment;
      this.evaluation_date = new Date(entry.evaluation_date);
      this.gauges = entry.gauges;
      this.estimated_evaluation_date = new Date(entry.estimated_evaluation_date);
      this.person_in_charge = entry.person_in_charge;
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
        } else {
          resolve(items);
        }
      }
    });
  }
}
