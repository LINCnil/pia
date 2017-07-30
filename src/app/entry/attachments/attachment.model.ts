import { ApplicationDb } from "../../application.db";

export class Attachment extends ApplicationDb {
  public id: number;
  public file: Blob;
  public name: string;
  public mime_type: string;
  public pia_signed: Boolean;

  constructor() {
    super(201707071818, 'attachment');
  }

  async create() {
    this.created_at = new Date();
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      this.objectStore.add({
        name: this.name, mime_type: this.mime_type, pia_id: this.pia_id,
        pia_signed: false, file: this.file, created_at: this.created_at
      }).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }
}
