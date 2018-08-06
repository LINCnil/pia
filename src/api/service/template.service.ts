import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Template } from '../model';

@Injectable()
export class TemplateService extends BaseService<Template> {

  protected modelClass = Template;

  protected routing: any = {
    all: '/pia-templates'
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getAll(): Observable<Template[]> {
    return this.httpGetAll(this.routing.all);
  }
}
