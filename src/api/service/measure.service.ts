
import { BaseService } from '@api/service/base.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Measure } from '@api/model/measure.model';
import { Injectable } from '@angular/core';
import { BaseModel } from '@api/model/base.model';

@Injectable()
export class MeasureService extends BaseService<Measure> {

  protected modelClass = Measure;

  protected routing: any = {
    all: '/pias/{piaId}/measures',
    one: '/pias/{piaId}/measures/{id}'
  };

  public getAll(piaId: any): Observable<Measure[]> {
    return this.httpGetAll(this.routing.all, { piaId: piaId });
  }

  public get(piaId: any, id: any): Observable<Measure> {
    return this.httpGetOne(this.routing.one, { piaId: piaId, id: id });
  }

  public getByRef(piaId: any, ref: any): Observable<Measure> {
    return this.httpGetFirst(this.routing.all, { piaId: piaId }, { reference_to: ref });
  }

  public update(model: Measure): Observable<Measure> {
    return this.httpPut(this.routing.one, { piaId: model.pia_id, id: model.id }, model);
  }

  public create(model: Measure): Observable<Measure> {
    return this.httpPost(this.routing.all, { piaId: model.pia_id }, model);
  }

  public deleteById(piaId: any, id: any): Observable<Measure> {
    return this.httpDelete(this.routing.one, { piaId: piaId, id: id });
  }

  public delete(model: Measure): Observable<Measure> {
    return this.deleteById(model.pia_id, model.id);
  }
}
