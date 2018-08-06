import { BaseModel } from './base.model';

export class UserProfile extends BaseModel {
  public username: string;
  public email: string;
  public roles: string[];
  public structure: UserProfileStructure;
  public portfolios: UserProfilePortfolio[];
  public portfolio_structures: UserProfileStructure[];
}

export interface UserProfilePortfolio {
  id: any;
  name: string;
}

export interface UserProfileStructure {
  id: any;
  name: string;
}

