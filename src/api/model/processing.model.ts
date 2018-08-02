
import { BaseModel } from '@api/model/base.model';
import { PiaModel, FolderModel } from '@api/models';

export class Processing extends BaseModel {
  public id: any;
  public name: string;
  public status: string;
  public description: string;
  public author: string;
  public lifeCycle: string;
  public storage: string;
  public standards: string;
  public processors: any;
  public controllers: any;
  public nonEuTransfer: string;
  public dataTypes: any;
  public folder: FolderModel;
  public pias: PiaModel[];
}
