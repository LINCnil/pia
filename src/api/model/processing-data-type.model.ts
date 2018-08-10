
import { BaseModel } from '@api/model/base.model';
import { ProcessingModel } from '@api/models';

export class ProcessingDataType extends BaseModel {
  public id: any;
  public reference: string;
  public data: string;
  public retention_period: string = '';
  public sensitive: boolean = false;
  public processing: ProcessingModel;
  public processing_id: any;
}
