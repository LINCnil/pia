export class Attachment {
  public id: number;
  public file: string | ArrayBuffer | any;
  public name: string;
  public mime_type: string;
  public pia_signed = 0;
  public comment: string;
  public pia_id: number;
  public created_at: Date;
  public updated_at: Date;
}
