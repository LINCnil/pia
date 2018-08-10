
import { BaseService } from '@api/service/base.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { ProcessingDataType } from '@api/model/processing-data-type.model';
import { Injectable } from '@angular/core';

@Injectable()
export class ProcessingDataTypeService extends BaseService<ProcessingDataType> {

  protected modelClass = ProcessingDataType;

  protected routing: any = {
    all: '/processing-data-types',
    one: '/processing-data-types/{id}'
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getAll(): Observable<ProcessingDataType[]> {
    return this.httpGetAll(this.routing.all);
  }

  public get(id: any): Observable<ProcessingDataType> {
    return this.httpGetOne(this.routing.one, { id: id });
  }

  public update(model: ProcessingDataType): Observable<ProcessingDataType> {
    return this.httpPut(this.routing.one, { id: model.id }, model);
  }

  public create(model: ProcessingDataType): Observable<ProcessingDataType> {
    return this.httpPost(this.routing.all, {}, model);
  }

  public deleteById(id: any): Observable<ProcessingDataType> {
    return this.httpDelete(this.routing.one, { id: id });
  }

  public delete(model: ProcessingDataType): Observable<ProcessingDataType> {
    return this.deleteById(model.id);
  }
}
