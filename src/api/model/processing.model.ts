
import { BaseModel } from '@api/model/base.model';
import { PiaModel, FolderModel } from '@api/models';

export class Processing extends BaseModel {
  public id: any;
  public name: string;
  public status: string;
  public description: string;
  public author: string;
  public life_cycle: string;
  public storage: string;
  public standards: string;
  public processors: any;
  public controllers: any;
  public non_eu_transfer: string;
  public processing_data_types: any;
  public folder: FolderModel;
  public pias_count: number;
}
