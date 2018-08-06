import { StringUtil, ArrayUtil } from '@utils/core';
import { BaseModel } from './base.model';

export class Answer extends BaseModel {
  public id: any;
  public pia_id: any;
  public reference_to: string;
  public data: { text: string, gauge: number, list: string[] };
  public answer_type: string;

  public isValidForType(type: any): boolean {
    let isValid = false;
    switch (<AnswerType>type) {
      case AnswerType.Gauge: {
         isValid = StringUtil.isNotEmpty(this.data.text) && this.data.gauge > 0;
        break;
      }
      case AnswerType.List: {
         isValid = ArrayUtil.isNotEmpty(this.data.list);
        break;
      }
      case AnswerType.Text: {
         isValid = StringUtil.isNotEmpty(this.data.text);
        break;
      }
    }
    return isValid;
  }
}

export enum AnswerType {
  Gauge = 'gauge',
  List = 'list',
  Text = 'text'
}
