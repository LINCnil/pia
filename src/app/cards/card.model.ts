import { piaDb } from '../piadb';

export class Card {
  public id: number;
  public status: number;
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
  public creation_date: Date;
  public last_open_date: Date;
  private piaDb: piaDb;

  constructor() {
    this.piaDb = new piaDb();
    this.creation_date = new Date();
  }

  async findAll() {
    return this.piaDb.findAllPia();
  }

  async create() {
    this.creation_date = new Date();
    return this.piaDb.createPia(this.name, this.author_name, this.evaluator_name, this.validator_name, this.creation_date);
  }

  async find(id) {
    this.piaDb.findPia(id).then((entry: any) => {
      console.log(entry);
      this.id = entry.id;
      this.name = entry.name;
      this.author_name = entry.author_name;
      this.evaluator_name = entry.evaluator_name;
      this.validator_name = entry.validator_name;
    });
  }

  update() {
    this.piaDb.updatePia(this.id, this.name, this.author_name, this.evaluator_name, this.validator_name);
  }

  async delete(id) {
    return this.piaDb.deletePia(id);
  }
}
