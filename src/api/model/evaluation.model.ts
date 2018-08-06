
import { BaseModel } from './base.model';
import * as Moment from 'moment';

export class Evaluation extends BaseModel {

  public id: any;
  public pia_id: any;
  public reference_to: string;
  public status = EvaluationStatus.Pending;
  public action_plan_comment: string;
  public evaluation_comment: string;
  public evaluation_date: Date;
  public gauges: { x: number, y: number } = { x: 0, y: 0 };
  public estimated_implementation_date: Date;
  public person_in_charge: string;
  public global_status = EvaluationGlobalStatus.None;


  public getStatusLabel(): string {
      return this.status >= 0 ? `evaluations.status.${this.status}` : '';
  }

  public mapFromJson(json: any): any {
    return Object.assign({}, super.mapFromJson(json), {
      evaluation_date : json.evaluation_date ? Moment(json.evaluation_date).toDate() : null,
      estimated_implementation_date : json.estimated_implementation_date ? Moment(json.estimated_implementation_date).toDate() : null,
      created_at: json.created_at ? Moment(json.created_at).toDate() : null,
      updated_at: json.updated_at ? Moment(json.updated_at).toDate() : null
    });
  }

  public mapToJson(): any {
    return Object.assign({}, super.mapToJson(), {
      evaluation_date : this.evaluation_date ? Moment(this.evaluation_date).format() : Moment().format(),
      estimated_implementation_date : this.estimated_implementation_date ? Moment(this.estimated_implementation_date).format() : Moment().format(),
      created_at: Moment(this.created_at).format(),
      updated_at: Moment(this.updated_at).format()
    });
  }

  public isPending(): boolean {
    return this.status === EvaluationStatus.Pending;
  }
  public isToBeFixed(): boolean {
    return this.status === EvaluationStatus.ToBeFixed;
  }
  public isImprovable(): boolean {
    return this.status === EvaluationStatus.Improvable;
  }
  public isAcceptable(): boolean {
    return this.status === EvaluationStatus.Acceptable;
  }
  public isStarted(): boolean {
    return this.status !== EvaluationStatus.Pending;
  }
  public isCompleted(): boolean {
    return this.isStarted() && this.isGloballyCompleted();
  }
  public isGloballyStarted(): boolean {
    return this.global_status === EvaluationGlobalStatus.Started;
  }
  public isGloballyCompleted(): boolean {
    return this.global_status === EvaluationGlobalStatus.Completed;
  }
  public hasEvaluationComment(): boolean {
    return this.evaluation_comment && this.evaluation_comment.length > 0
  }
  public hasActionPlanComment(): boolean {
    return this.action_plan_comment && this.action_plan_comment.length > 0;
  }
  public hasAssignedGauges(): boolean {
    return this.gauges && this.gauges['x'] > 0 && this.gauges['y'] > 0;
  }
  public beGloballyNone(): void {
    this.global_status = EvaluationGlobalStatus.None;
  }
  public beGloballyStarted(): void {
    this.global_status = EvaluationGlobalStatus.Started;
  }
  public beGloballyCompleted(): void {
    this.global_status = EvaluationGlobalStatus.Completed;
  }

}

export enum EvaluationStatus {
  Pending = 0,
  ToBeFixed = 1,
  Improvable = 2,
  Acceptable = 3
}

export enum EvaluationGlobalStatus {
  None = 0,
  Started = 1,
  Completed = 2
}
