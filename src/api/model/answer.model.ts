
import {BaseModel} from '@api/model/base.model'

export class Answer extends BaseModel {
  public id: any;
  public pia_id: any;
  public reference_to: string;
  public data: { text: string, gauge: number, list: string[] };
  public answer_type: string;
}
