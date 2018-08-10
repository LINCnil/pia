import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { BaseService } from '@api/service/base.service';
import { Processing } from '@api/model/processing.model';
import { FolderModel } from '@api/models';

@Injectable()
export class ProcessingService extends BaseService<Processing> {

  protected modelClass = Processing;

  protected routing: any = {
    all: '/processings',
    one: '/processings/{id}',
    export: '/processings/{id}/export',
    import: '/processings/import'
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getAll(): Observable<Processing[]> {
    return this.httpGetAll(this.routing.all);
  }

  public get(id: any): Observable<Processing> {
    return this.httpGetOne(this.routing.one, { id: id });
  }

  public update(model: Processing): Observable<Processing> {
    return this.httpPut(this.routing.one, { id: model.id }, model);
  }

  public create(model: Processing, folder: FolderModel): Observable<Processing> {
    model.folder = folder;
    return this.httpPost(this.routing.all, {}, model);
  }

  public deleteById(id: any): Observable<Processing> {
    return this.httpDelete(this.routing.one, { id: id });
  }

  public delete(model: Processing): Observable<Processing> {
    return this.deleteById(model.id);
  }

  public export(id: number): Observable<string> {
    const query: any = this.buildQuery({});
    const route = this.buildRoute(this.routing.export, {id: id});

    return this.http.get(route, { params: query }).pipe(map((res: any) => {
      return res
    }));
  }

  public import(data: any): Observable<Processing> {
    const query: any = this.buildQuery({});
    const route = this.buildRoute(this.routing.import, {name: name});

    return this.http.post(route, {data: data}, { params: query }).pipe(map(res => this.mapToModel(res, this.modelClass)));
  }
}
