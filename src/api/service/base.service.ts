
import { BaseModel } from '../model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map, first } from 'rxjs/operators';
import * as UrlTemplate from 'url-template';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable()
export class BaseService<T extends BaseModel> {
  protected modelClass: any;
  protected routing: any;
  protected host = environment.api.host;

  constructor(protected http: HttpClient) { }

  protected httpGetAll(routeTpl: string, params: any = {}, query: any = {}): Observable<T[]> {
    query = this.buildQuery(query);
    const route = this.buildRoute(routeTpl, params);

    return this.http.get(route, { params: query }).pipe(map(res => this.mapToCollection(res, this.modelClass)));
  }

  protected httpGetOne(routeTpl: string, params: any = {}, query: any = {}): Observable<T> {
    query = this.buildQuery(query);
    const route = this.buildRoute(routeTpl, params);

    return this.http.get(route, { params: query }).pipe(map(res => this.mapToModel(res, this.modelClass)));
  }

  protected httpGetFirst(routeTpl: string, params: any = {}, query: any = {}): Observable<T> {

    return this.httpGetAll(routeTpl, params, query).pipe(first(null, res => res[0], null));
  }

  protected httpPut(routeTpl: string, params: any = {}, model: T, query: any = {}): Observable<T> {
    query = this.buildQuery(query);
    const route = this.buildRoute(routeTpl, params);

    return this.http.put(route, model.toJson(), { params: query }).pipe(map(res => this.mapToModel(res, this.modelClass)));
  }

  protected httpPost(routeTpl: string, params: any = {}, model: T, query: any = {}): Observable<T> {
    query = this.buildQuery(query);
    const route = this.buildRoute(routeTpl, params);

    return this.http.post(route, model.toJson(), { params: query }).pipe(map(res => this.mapToModel(res, this.modelClass)));
  }

  protected httpDelete(routeTpl: string, params: any = {}, query: any = {}): Observable<T> {
    query = this.buildQuery(query);
    const route = this.buildRoute(routeTpl, params);

    return this.http.delete(route, { params: query }).pipe(map(res => this.mapToModel(res, this.modelClass)));
  }

  protected buildRoute(route: string, params: any = {}): string {
    const tpl = UrlTemplate.parse(this.host + route);
    return tpl.expand(params);
  }

  protected mapToModel(res: any, modelClass: new () => T) {
    return (new modelClass()).fromJson(res);
  }

  protected mapToCollection(res: any, modelClass: new () => T) {
    return res.map(item => (new modelClass()).fromJson(item));
  }

  protected buildQuery(query: any): HttpParams {
    let params = new HttpParams();

    for (const key of Object.keys(query)) {
      params = params.set(key, query[key]);
    }

    return params;
  }
}
