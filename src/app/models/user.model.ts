export class User {
  public access_token?: string;
  public id?: number;
  public email: string;
  public lastname: string;
  public firstname: string;
  public access_type: Array<string> = [];
  public uuid?: string;
  resource_owner_id?: number;
  user_pias?: Array<any>;
}
