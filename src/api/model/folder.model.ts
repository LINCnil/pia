import { BaseModel } from '@api/model/base.model'
import { ProcessingModel, FolderModel } from '@api/models'

export class Folder extends BaseModel {
  public name: string;
  public structure_id: any;
  public parent: FolderModel;
  public children: FolderModel[];
  public processings: ProcessingModel[];
  public isRoot: boolean;
}
