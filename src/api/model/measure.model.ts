import { StringUtil } from '@utils/string.util';
import { BaseModel } from './base.model';

export class Measure extends BaseModel {

  public id: any;
  public pia_id: any;
  public title: string;
  public content: string;
  public placeholder: string;


  public hasValidTitleAndContent(): boolean {
    return StringUtil.isNotEmpty(this.title) || StringUtil.isNotEmpty(this.content);
  }
}
