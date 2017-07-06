export class CommentItem {
  public id: number;
  public content: string;

  constructor(id = null, content = null) {
    this.id = id;
    this.content = content;
  }
}
