import { ApplicationDb } from '../../../application.db';

export class Evaluation extends ApplicationDb {
  public id: number;
  public status: number; // 0: pending, 1: toBeFixed, 2: improvable, 3: acceptable
  public reference_to: string;
  public action_plan_comment: string;
  public evaluation_comment: string;
  public evaluation_date: Date;
  public gauges: {x: number, y: number};
  public estimated_evaluation_date: Date;
  public person_in_charge: string;
  public global_status: number; // 0: pending, 1: Validate

  constructor() {
    super(201707071818, 'evaluation');
  }

  async create() {
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      this.objectStore.add({
        status: 0,
        pia_id: this.pia_id,
        reference_to: this.reference_to,
        action_plan_comment: this.action_plan_comment,
        evaluation_comment: this.evaluation_comment,
        evaluation_date: this.evaluation_date,
        gauges: this.gauges,
        estimated_evaluation_date: new Date(this.estimated_evaluation_date),
        person_in_charge: this.person_in_charge,
        global_status: 0,
        created_at: new Date()
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
        entry.estimated_evaluation_date = new Date(this.estimated_evaluation_date);
        entry.person_in_charge = this.person_in_charge;
        entry.global_status = this.global_status;
        entry.updated_at = new Date();
        this.getObjectStore().then(() => {
          this.objectStore.put(entry).onsuccess = () => {
            resolve();
          };
        });
      });
    });
  }

  /* Get an evaluation for a specific question or a specific measure */
  async getByReference(pia_id: number, reference_to: any) {
    this.pia_id = pia_id;
    if (this.pia_id) {
      // TODO - Know why we must check for presence of pia_id
      this.reference_to = reference_to;
      await this.getObjectStore();
      return new Promise((resolve, reject) => {
        const index1 = this.objectStore.index('index1');
        index1.get(IDBKeyRange.only([this.pia_id, this.reference_to])).onsuccess = (event: any) => {
          const entry = event.target.result;
          if (entry) {
            this.id = entry.id;
            this.status = entry.status;
            this.pia_id = parseInt(entry.pia_id, 10);
            this.reference_to = entry.reference_to;
            this.action_plan_comment = entry.action_plan_comment;
            this.evaluation_comment = entry.evaluation_comment;
            this.evaluation_date = entry.evaluation_date;
            this.gauges = entry.gauges;
            this.estimated_evaluation_date = new Date(entry.estimated_evaluation_date);
            this.person_in_charge = entry.person_in_charge;
            this.global_status = entry.global_status;
            this.created_at = new Date(entry.created_at);
            this.updated_at = new Date(entry.updated_at);
            resolve(this);
          } else {
            resolve(false);
          }
        }
      });
    }
  }

  async get(id: number) {
    this.id = id;
    return new Promise((resolve, reject) => {
      this.find(this.id).then((entry: any) => {
        this.id = entry.id;
        this.status = entry.status;
        this.pia_id = parseInt(entry.pia_id, 10);
        this.reference_to = entry.reference_to;
        this.action_plan_comment = entry.action_plan_comment;
        this.evaluation_comment = entry.evaluation_comment;
        this.evaluation_date = entry.evaluation_date;
        this.gauges = entry.gauges;
        this.estimated_evaluation_date = new Date(entry.estimated_evaluation_date);
        this.person_in_charge = entry.person_in_charge;
        this.global_status = entry.global_status;
        this.created_at = new Date(entry.created_at);
        this.updated_at = new Date(entry.updated_at);
        resolve(this);
      });
    });
  }

  async findAll() {
    const items = [];
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      const index1 = this.objectStore.index('index2');
      index1.openCursor(IDBKeyRange.only(this.pia_id)).onsuccess = (event: any) => {
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

  async existByReference(pia_id: number, reference_to: any) {
    this.pia_id = pia_id;
    this.reference_to = reference_to;
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      const index1 = this.objectStore.index('index1');
      index1.get(IDBKeyRange.only([this.pia_id, this.reference_to])).onsuccess = (event: any) => {
        const entry = event.target.result;
        if (entry) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  }

  async globalStatusByReference(pia_id: number, reference_to: any) {
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      const index1 = this.objectStore.index('index1');
      index1.get(IDBKeyRange.only([pia_id, reference_to])).onsuccess = (event: any) => {
        const entry = event.target.result;
        if (entry) {
          if (entry.global_status === 1) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      }
    });
  }
}
