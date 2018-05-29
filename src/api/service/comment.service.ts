
import { BaseService } from '@api/service/base.service';
import { Observable } from 'rxjs/Observable';
import { Comment } from '@api/model/comment.model';
import { Injectable } from '@angular/core';
import { BaseModel } from '@api/model/base.model';

@Injectable()
export class CommentService extends BaseService<Comment> {

  protected modelClass = Comment;

  protected routing: any = {
    all: '/pias/{piaId}/comments',
    one: '/pias/{piaId}/comments/{id}'
  };

  public getAll(piaId: any): Observable<Comment[]> {
    return this.httpGetAll(this.routing.all, {piaId: piaId});
  }

  public get(piaId: any, id: any): Observable<Comment> {
    return this.httpGetOne(this.routing.one, {piaId: piaId, id: id });
  }

  public getAllByRef(piaId: any, ref: any): Observable<Comment[]> {
    return this.httpGetAll(this.routing.all, { piaId: piaId }, { reference_to: ref });
  }

  public update(model: Comment): Observable<Comment> {
    return this.httpPut(this.routing.one, {piaId: model.pia_id, id: model.id }, model);
  }

  public create(model: Comment): Observable<Comment> {
    return this.httpPost(this.routing.all, {piaId: model.pia_id}, model);
  }

  public deleteById(piaId: any, id: any): Observable<Comment> {
    return this.httpDelete(this.routing.one, {piaId: piaId, id: id });
  }

  public delete(model: Comment): Observable<Comment> {
    return this.deleteById(model.pia_id, model.id);
  }
}
