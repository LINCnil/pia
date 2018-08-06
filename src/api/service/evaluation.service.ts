
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Observable';
import { Evaluation } from '../model';
import { Injectable } from '@angular/core';

@Injectable()
export class EvaluationService extends BaseService<Evaluation> {

  protected modelClass = Evaluation;

  protected routing: any = {
    all: '/pias/{piaId}/evaluations',
    one: '/pias/{piaId}/evaluations/{id}'
  };

  public getAll(piaId: any): Observable<Evaluation[]> {
    return this.httpGetAll(this.routing.all, {piaId: piaId});
  }

  public get(piaId: any, id: any): Observable<Evaluation> {
    return this.httpGetOne(this.routing.one, {piaId: piaId, id: id });
  }

  public getByRef(piaId: any, ref: any): Observable<Evaluation> {
    return this.httpGetFirst(this.routing.all, {piaId: piaId}, {reference_to: ref});
  }

  public update(model: Evaluation): Observable<Evaluation> {
    return this.httpPut(this.routing.one, {piaId: model.pia_id, id: model.id }, model);
  }

  public create(model: Evaluation): Observable<Evaluation> {
    return this.httpPost(this.routing.all, {piaId: model.pia_id}, model);
  }

  public deleteById(piaId: any, id: any): Observable<Evaluation> {
    return this.httpDelete(this.routing.one, {piaId: piaId, id: id });
  }

  public delete(model: Evaluation): Observable<Evaluation> {
    return this.deleteById(model.pia_id, model.id);
  }
}
