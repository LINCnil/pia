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
  public creation_date;
  public last_open_date;

  constructor(id = null, status = null, name = null, author_name = null, evaluator_name = null, validator_name = null, dpo_status = null, dpo_opinion = null, concerned_people_opinion  = null, concerned_people_status = null, rejected_reason = null, applied_adjustements = null, creation_date = null, last_open_date = null) {
    this.id = id;
    this.status = status;
    this.name = name;
    this.author_name = author_name;
    this.evaluator_name = evaluator_name;
    this.validator_name = validator_name;
    this.dpo_status = dpo_status;
    this.dpo_opinion = dpo_opinion;
    this.concerned_people_opinion = concerned_people_opinion;
    this.concerned_people_status = concerned_people_status;
    this.rejected_reason = rejected_reason;
    this.applied_adjustements = applied_adjustements;
    this.creation_date = creation_date;
    this.last_open_date = last_open_date;
  }
}
