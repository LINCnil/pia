
import { BaseModel } from './base.model';

export class ProcessingAttachment extends BaseModel {

  public id: any;
  public processing_id: any;
  public file: Blob;
  public name: string;
  public mime_type: string;
  public comment: string;
}
