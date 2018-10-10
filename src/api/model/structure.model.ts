import { BaseModel } from './base.model';

export class Structure extends BaseModel {
  public id: any;
  public name: string;
  public address: string;
  public phone: string;
  public siren: string;
  public siret: string;
  public vat_number: string;
  public activity_code: string;
  public legal_form: string;
  public registration_date: string;
  public executive: string;
  public backup: string;
  public dpo: string;
}
