
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Observable';
import { ProcessingAttachment } from '../model';

@Injectable()
export class ProcessingAttachmentService extends BaseService<ProcessingAttachment> {

  protected modelClass = ProcessingAttachment;

  protected routing: any = {
    all: '/processings/{processingId}/attachments',
    one: '/processings/{processingId}/attachments/{id}'
  };

  public getAll(processingId: any): Observable<ProcessingAttachment[]> {
    return this.httpGetAll(this.routing.all, {processingId: processingId});
  }

  public get(processingId: any, id: any): Observable<ProcessingAttachment> {
    return this.httpGetOne(this.routing.one, {processingId: processingId, id: id });
  }

  public update(model: ProcessingAttachment): Observable<ProcessingAttachment> {
    return this.httpPut(this.routing.one, {processingId: model.processing_id, id: model.id }, model);
  }

  public create(model: ProcessingAttachment): Observable<ProcessingAttachment> {
    return this.httpPost(this.routing.all, {processingId: model.processing_id}, model);
  }

  public deleteById(processingId: any, id: any): Observable<ProcessingAttachment> {
    return this.httpDelete(this.routing.one, {processingId: processingId, id: id });
  }

  public delete(model: ProcessingAttachment): Observable<ProcessingAttachment> {
    return this.deleteById(model.processing_id, model.id);
  }
}
