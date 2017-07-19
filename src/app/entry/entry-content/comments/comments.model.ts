/* Might be useless with the new comment model */
/* But this model is used in comments.component.ts with ngFor on comments[] */
/* TODO : fix this functionnality using the new Comment model */

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
