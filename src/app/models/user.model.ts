export class User {
  public token?: string;
  public id?: number;
  public email: string;
  public lastname: string;
  public firstname: string;
  public access_type: Array<string> = [];
  public uuid?: string;
}
