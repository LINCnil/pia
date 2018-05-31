import { BaseModel } from '@api/model/base.model'

export class Template extends BaseModel {
  public id: any;
  public enabled: boolean;
  public name: string;
  public description: string;
  public imported_file_name: string;
  public created_at: any;
  public updated_at: any;

}