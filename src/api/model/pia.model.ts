
import { BaseModel } from '@api/model/base.model'
import { FolderModel } from '@api/models';

export class Pia extends BaseModel {
  public id: any;
  public status = 0; // 0: doing, 1: refused, 2: simple_validation, 3: signed_validation, 4: archived
  public name: string;
  public author_name: string;
  public evaluator_name: string;
  public validator_name: string;
  public dpo_status: number = 0; // 0: NOK, 1: OK
  public dpo_opinion: string;
  public concerned_people_opinion: string;
  public concerned_people_status: number = 0; // 0: NOK, 1: OK
  public concerned_people_searched_opinion: boolean = false; // 0 : false, 1: true
  public concerned_people_searched_content: string;
  public rejected_reason: string;
  public applied_adjustements: string;
  public dpos_names: string;
  public people_names: string;
  public progress: number;
  public is_example: boolean = false;
  public folder: FolderModel;
  public type: string = PiaType.regular;

  public numberOfQuestions = 36; // TODO Auto compute questions number

  public getStatusLabel(): string {
    return this.status >= 0 ? `pia.statuses.${this.status}` : '';
  }

  public getGaugeLabel(value: any): string {
    return value ? `summary.gauges.${value}` : '';
  }

  public validationIsCompleted(): boolean {
    return  [
      PiaStatus.SimpleValidation,
      PiaStatus.SignedValidation,
      PiaStatus.Archived
    ].includes(this.status);
  }
}

export enum PiaStatus {
  Doing = 0,
  Refused = 1,
  SimpleValidation = 2,
  SignedValidation = 3,
  Archived = 4
}

export enum PiaType {
  simplified = 'simplified',
  regular = 'regular',
  advanced = 'advanced'
}
