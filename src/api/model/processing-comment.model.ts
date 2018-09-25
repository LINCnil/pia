import { BaseModel } from './base.model';

export class ProcessingComment extends BaseModel {
  public id: any;
  public processing_id: any;
  public field: string;
  public content: string;
  public created_at: Date;
}
