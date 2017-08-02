import { ApplicationDb } from '../../../application.db';

export class Evaluation extends ApplicationDb {
  public id: number;
  public status: number; // 0: pending, 1: refused, 2: improvable, 3: approved
  public reference_to: string;
  public action_plan_comment: string;
  public evaluation_comment: string;
  public evaluation_date: Date;
  public gauges: number[];
  public estimated_evaluation_date: Date;
  public person_in_charge: string;

  constructor() {
    super(201707071818, 'evaluation');
  }

  async create() {
    if (this.created_at === undefined) {
      this.created_at = new Date();
    }
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      this.objectStore.add({
        status: 0,
        reference_to: this.reference_to,
        action_plan_comment: this.action_plan_comment,
        evaluation_comment: this.evaluation_comment,
        evaluation_date: this.evaluation_date,
        gauges: this.gauges,
        estimated_evaluation_date: this.estimated_evaluation_date,
        person_in_charge: this.person_in_charge,
        created_at: this.created_at,
        updated_at: new Date()
      }).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async update() {
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        entry.status = this.status;
        entry.reference_to = this.reference_to;
        entry.action_plan_comment = this.action_plan_comment;
        entry.evaluation_comment = this.evaluation_comment;
        entry.evaluation_date = this.evaluation_date;
        entry.gauges = this.gauges;
        entry.estimated_evaluation_date = this.estimated_evaluation_date;
        entry.person_in_charge = this.person_in_charge;
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
        this.status = entry.status;
        this.reference_to = entry.reference_to;
        this.action_plan_comment = entry.action_plan_comment;
        this.evaluation_comment = entry.evaluation_comment;
        this.evaluation_date = entry.evaluation_date;
        this.gauges = entry.gauges;
        this.estimated_evaluation_date = entry.estimated_evaluation_date;
        this.person_in_charge = entry.person_in_charge;
        this.created_at = new Date(entry.created_at);
        this.updated_at = new Date(entry.updated_at);
        resolve();
      });
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
