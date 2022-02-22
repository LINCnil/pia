export class Evaluation {
  public id: number;
  public status = 0; // 0: pending, 1: toBeFixed, 2: improvable, 3: acceptable
  public action_plan_comment: string;
  public evaluation_comment: string;
  public evaluation_date: Date;
  public gauges: { x: number; y: number };
  public estimated_implementation_date: Date;
  public person_in_charge: string;
  public pia_id: number;
  public reference_to;
  public global_status = 0; // 0: No evaluation, 1: Evaluation started, 2: Evaluation completed
  public created_at;
  public updated_at;
  evaluation_infos: string;
}
