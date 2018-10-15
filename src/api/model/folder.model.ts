import { BaseModel } from './base.model';
import { Processing } from './processing.model';

export class Folder extends BaseModel {
  public name: string;
  public structure_id: any;
  public parent: Folder;
  public children: Folder[];
  public processings: Processing[];
  public isRoot: boolean;
  public person_in_charge: string;
}
