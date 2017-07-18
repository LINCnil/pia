import { applicationDb } from "../../application.db";

export class Attachment extends applicationDb {
  public id: number;
  public pia_id: number;
  public file: Blob;
  public name: string;
  public type: string;
  public pia_signed: Boolean;
  public created_at: Date;
  public updated_at: Date;

  constructor() {
    super(201707071818, 'attachment');
  }

  async create() {
    this.created_at = new Date();
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      this.objectStore.add({
        name: this.name, type: this.type, pia_signed: false,
        file: this.file, created_at: this.created_at
      }).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }
}
