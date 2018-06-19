
import { BaseService } from '@api/service/base.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Pia } from '@api/model/pia.model';
import { Evaluation } from '@api/model/evaluation.model';
import { Answer } from '@api/model/answer.model';
import { Injectable } from '@angular/core';
import { BaseModel } from '@api/model/base.model';
import { AnswerService } from '@api/service/answer.service';
import { Template } from '@api/model/template.model';
import { FolderModel } from '@api/models';

@Injectable()
export class PiaService extends BaseService<Pia> {

  protected modelClass = Pia;

  protected routing: any = {
    all: '/pias',
    one: '/pias/{id}',
    template: '/pias/new-from-template/{templateId}',
    export: '/pias/export/{id}',
    import: '/pias/import'
  };

  constructor(http: HttpClient, protected answerService: AnswerService) {
    super(http);
  }

  public computeProgressFromAnswers(model: Pia, answers:Answer[]): number {
      model.progress = Math.round((100 / model.numberOfQuestions) * answers.length);
      return model.progress;
  }

  public createFromTemplate(model: Pia, template: Template, folder: FolderModel): Observable<Pia> {
    model.folder = folder;
    return this.httpPost(this.routing.template, {templateId: template.id}, model);
  }

  public getAll(): Observable<Pia[]> {
    return this.httpGetAll(this.routing.all);
  }

  public get(id: any): Observable<Pia> {
    return this.httpGetOne(this.routing.one, { id: id });
  }

  public update(model: Pia): Observable<Pia> {
    return this.httpPut(this.routing.one, { id: model.id }, model);
  }

  public create(model: Pia, folder: FolderModel): Observable<Pia> {
    model.folder = folder;
    return this.httpPost(this.routing.all, {}, model);
  }

  public deleteById(id: any): Observable<Pia> {
    return this.httpDelete(this.routing.one, { id: id });
  }

  public delete(model: Pia): Observable<Pia> {
    return this.deleteById(model.id);
  }

  public export(id: number): Observable<string> {
    let query: any = this.buildQuery({});
    const route = this.buildRoute(this.routing.export, {id: id});

    return this.http.get(route, { params: query }).map((res: any) => {
      return res
    });
  }

  public import(data: any): Observable<Pia> {
    let query: any = this.buildQuery({});
    const route = this.buildRoute(this.routing.import, {name: name});

    return this.http.post(route, {data: data}, { params: query }).map(res => this.mapToModel(res, this.modelClass));
  }
}
