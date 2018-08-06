
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Observable';
import { Attachment } from '../model';
import { Injectable } from '@angular/core';

@Injectable()
export class AttachmentService extends BaseService<Attachment> {

  protected modelClass = Attachment;

  protected routing: any = {
    all: '/pias/{piaId}/attachments',
    one: '/pias/{piaId}/attachments/{id}'
  };

  public getAll(piaId: any): Observable<Attachment[]> {
    return this.httpGetAll(this.routing.all, {piaId: piaId});
  }

  public get(piaId: any, id: any): Observable<Attachment> {
    return this.httpGetOne(this.routing.one, {piaId: piaId, id: id });
  }

  public update(model: Attachment): Observable<Attachment> {
    return this.httpPut(this.routing.one, {piaId: model.pia_id, id: model.id }, model);
  }

  public create(model: Attachment): Observable<Attachment> {
    return this.httpPost(this.routing.all, {piaId: model.pia_id}, model);
  }

  public deleteById(piaId: any, id: any): Observable<Attachment> {
    return this.httpDelete(this.routing.one, {piaId: piaId, id: id });
  }

  public delete(model: Attachment): Observable<Attachment> {
    return this.deleteById(model.pia_id, model.id);
  }
}
