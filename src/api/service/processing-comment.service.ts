
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Observable';
import { ProcessingComment } from '../model';
import { Injectable } from '@angular/core';

@Injectable()
export class ProcessingCommentService extends BaseService<ProcessingComment> {

  protected modelClass = ProcessingComment;

  protected routing: any = {
    all: '/processing-comments',
    one: '/processing-comments/{id}',
    by:  '/processings/{processingId}/comments'
  };

  public getAll(processingId: any): Observable<ProcessingComment[]> {
    return this.httpGetAll(this.routing.by, {processingId: processingId});
  }

  public get(processingId: any, id: any): Observable<ProcessingComment> {
    return this.httpGetOne(this.routing.one, {processingId: processingId, id: id });
  }

  public getByRef(processingId: any, ref: any): Observable<ProcessingComment> {
    return this.httpGetOne(this.routing.one, { processingId: processingId }, { field: ref });
  }

  public update(model: ProcessingComment): Observable<ProcessingComment> {
    return this.httpPut(this.routing.one, {processingId: model.processing_id, id: model.id }, model);
  }

  public create(model: ProcessingComment): Observable<ProcessingComment> {
    return this.httpPost(this.routing.all, {processingId: model.processing_id}, model);
  }

  public deleteById(processingId: any, id: any): Observable<ProcessingComment> {
    return this.httpDelete(this.routing.one, {processingId: processingId, id: id });
  }

  public delete(model: ProcessingComment): Observable<ProcessingComment> {
    return this.deleteById(model.processing_id, model.id);
  }
}
