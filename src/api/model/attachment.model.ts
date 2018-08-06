
import { BaseModel } from './base.model';

export class Attachment extends BaseModel {

  public id: any;
  public pia_id: any;
  public file: Blob;
  public name: string;
  public mime_type: string;
  public pia_signed = 0;
  public comment: string;

}
