export class Card {
  public id: number;
  public name: string;
  public status: string;

  constructor(name: string, status: string) {
    this.id = null;
    this.name = name;
    this.status = status;
  }
}
