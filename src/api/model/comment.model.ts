import { BaseModel } from './base.model';

export class Comment extends BaseModel {
  public id: any;
  public pia_id: any;
  public reference_to: string;
  public description: string;
  public for_measure: boolean;
}
