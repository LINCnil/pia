import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { BaseService } from '@api/service/base.service';
import { Structure } from '@api/model/structure.model';

@Injectable()
export class StructureService extends BaseService<Structure> {

  protected modelClass = Structure;

  protected routing: any = {
    all: '/structures',
    one: '/structures/{id}'
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getAll(criteria?: string): Observable<Structure[]> {
    return this.httpGetAll(this.routing.all, null, criteria);
  }

  public get(id: any): Observable<Structure> {
    return this.httpGetOne(this.routing.one, { id: id });
  }

  public update(model: Structure): Observable<Structure> {
    return this.httpPut(this.routing.one, { id: model.id }, model);
  }

  public create(model: Structure): Observable<Structure> {
    return this.httpPost(this.routing.all, {}, model);
  }

  public deleteById(id: any): Observable<Structure> {
    return this.httpDelete(this.routing.one, { id: id });
  }

  public delete(model: Structure): Observable<Structure> {
    return this.deleteById(model.id);
  }
}
