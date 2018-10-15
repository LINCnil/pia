
import { BaseModel } from '@api/model/base.model';
import { FolderModel, ProcessingCommentModel, ProcessingAttachmentModel } from '@api/models';

export class Processing extends BaseModel {
  public id: any;
  public name: string;
  public status: number;
  public description: string;
  public author: string;
  public life_cycle: string;
  public storage: string;
  public standards: string;
  public processors: string;
  public designated_controller: string;
  public controllers: string;
  public non_eu_transfer: string;
  public processing_data_types: any;
  public folder: FolderModel;
  public pias_count: number;
  public recipients: string;
  public context_of_implementation: string;
  public lawfulness: string;
  public consent: string;
  public rights_guarantee: string;
  public exactness: string;
  public minimization: string;
  public evaluation_comment: string;
  public evaluation_state: number;
  public concerned_people: string;
  public comments: ProcessingCommentModel[] = [];
  public attachments: ProcessingAttachmentModel[] = [];
}

export enum ProcessingStatus {
  STATUS_DOING = 0,
  STATUS_UNDER_VALIDATION = 1,
  STATUS_VALIDATED = 2,
  STATUS_ARCHIVED = 3
}

export enum ProcessingEvaluationStates {
  EVALUATION_STATE_NONE = -1,
  EVALUATION_STATE_TO_CORRECT = 0,
  EVALUATION_STATE_IMPROVABLE = 1,
  EVALUATION_STATE_ACCEPTABLE = 2
}
