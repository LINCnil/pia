
import { BaseModel } from '@api/model/base.model'

export class Evaluation extends BaseModel {

  public id: any;
  public pia_id: any;
  public reference_to: string;
  public status = 0; // 0: pending, 1: toBeFixed, 2: improvable, 3: acceptable
  public action_plan_comment: string;
  public evaluation_comment: string;
  public evaluation_date: Date;
  public gauges: { x: number, y: number };
  public estimated_implementation_date: Date;
  public person_in_charge: string;
  public global_status = 0; // 0: No evaluation, 1: Evaluation started, 2: Evaluation completed


  public getStatusLabel():string {
      return this.status >= 0 ? `evaluation.statuses.${this.status}`: '';
  }
}
