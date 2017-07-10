export class Comment {
  public id: number;
  public description: string;
  public reference_to: string;
  public type: string;

  constructor(id: number = null, description: string = null, reference_to: string = null, type: string = null) {
    this.id = id;
    this.description = description;
    this.reference_to = reference_to;
    this.type = type;
  }



}
