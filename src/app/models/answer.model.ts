import { ApplicationDb } from '../application.db';

export class Answer {
  public id: number;
  public data: { text: string; gauge: number; list: string[] };
  public answer_type: string;
  public reference_to: any;
  public created_at: Date;
  public updated_at: Date;
  public pia_id: number;
}
