import { ApplicationDb } from "../application.db";

export class Pia extends ApplicationDb {
  public id: number;
  public status: number; // 1: doing, 2: refused, 3: simple_validation, 4: signed_validation
  public name: string;
  public author_name: string;
  public evaluator_name: string;
  public validator_name: string;
  public dpo_status: number;
  public dpo_opinion: string;
  public concerned_people_opinion: string;
  public concerned_people_status: string;
  public rejected_reason: string;
  public applied_adjustements: string;
  public created_at: Date;
  public updated_at: Date;

  constructor() {
    super(201707071818, 'pia');
  }

  async create() {
    if (this.created_at == undefined) {
      this.created_at = new Date();
    }
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      this.objectStore.add({
        name: this.name, author_name: this.author_name, evaluator_name: this.evaluator_name, validator_name: this.validator_name,
        created_at: this.created_at, updated_at: new Date(), status: 1
      }).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async update() {
    this.find(this.id).then((entry: any) => {
      entry.name = this.name;
      entry.author_name = this.author_name;
      entry.evaluator_name = this.evaluator_name;
      entry.validator_name = this.validator_name;
      entry.updated_at = new Date();
      this.objectStore.put(entry);
    });
  }

  async get(id: number) {
    this.id = id;
    this.find(this.id).then((entry: any) => {
      this.status = parseInt(entry.status);
      this.name = entry.name;
      this.author_name = entry.author_name;
      this.evaluator_name = entry.evaluator_name;
      this.validator_name = entry.validator_name;
      this.dpo_status = parseInt(entry.dpo_status);
      this.dpo_opinion = entry.dpo_opinion;
      this.concerned_people_opinion = entry.concerned_people_opinion;
      this.concerned_people_status = entry.concerned_people_status;
      this.rejected_reason = entry.rejected_reason;
      this.applied_adjustements = entry.applied_adjustements;
      this.created_at = new Date(entry.created_at);
      this.updated_at = new Date(entry.updated_at);
    });
  }
}
