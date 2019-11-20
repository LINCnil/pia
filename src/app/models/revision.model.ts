export class Revision {
  public id;
  public created_at;
  public export;
  public pia_id;

  constructor(id, date, data, piaId) {
    this.id = id;
    this.created_at = date;
    this.export = data;
    this.pia_id = piaId;
  }
}