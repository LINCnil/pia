import { BaseModel } from '@api/model/base.model'

export class UserProfile extends BaseModel {
  public username: string;
  public email: string;
  public roles: string[];
}
