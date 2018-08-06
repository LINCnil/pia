
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Answer} from '../model';

@Injectable()
export class AnswerService extends BaseService<Answer> {

  protected modelClass = Answer;

  protected routing: any = {
    all: '/pias/{piaId}/answers',
    one: '/pias/{piaId}/answers/{id}'
  };

  public getAll(piaId: any): Observable<Answer[]> {
    return this.httpGetAll(this.routing.all, { piaId: piaId });
  }

  public get(piaId: any, id: any): Observable<Answer> {
    return this.httpGetOne(this.routing.one, { piaId: piaId, id: id });
  }

  public getByRef(piaId: any, ref: any): Observable<Answer> {
    return this.httpGetFirst(this.routing.all, { piaId: piaId }, { reference_to: ref });
  }

  public update(model: Answer): Observable<Answer> {
    return this.httpPut(this.routing.one, { piaId: model.pia_id, id: model.id }, model);
  }

  public create(model: Answer): Observable<Answer> {
    return this.httpPost(this.routing.all, { piaId: model.pia_id }, model);
  }

  public deleteById(piaId: any, id: any): Observable<Answer> {
    return this.httpDelete(this.routing.one, { piaId: piaId, id: id });
  }

  public delete(model: Answer): Observable<Answer> {
    return this.deleteById(model.pia_id, model.id);
  }
}
