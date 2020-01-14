export class Revision {
  public export;
  public pia_id;
  public created_at;

  constructor(data, piaId, date) {
    this.created_at = date;
    this.export = data;
    this.pia_id = piaId;
  }
}
