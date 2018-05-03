
import { BaseService } from '@api/service/base.service';
import { Observable } from "rxjs/Observable";
import { Http } from '@angular/http';
import { Pia } from '@api/model/pia.model';
import { Evaluation } from '@api/model/evaluation.model';
import { Injectable } from '@angular/core';
import { BaseModel } from '@api/model/base.model';
import { AnswerService } from '@api/service/answer.service';

@Injectable()
export class PiaService extends BaseService<Pia> {

  protected modelClass = Pia;

  protected routing: any = {
    all: '/pias',
    one: '/pias/{id}',
  };

  constructor(http: Http, protected answerService: AnswerService) {
    super(http);
  }


  public computeProgress(model: Pia): Observable<number> {

    return this.answerService.getAll(model.id).map(answers => {
      model.progress = Math.round((100 / model.numberOfQuestions) * answers.length);
      return model.progress;
    });

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

  public create(model: Pia): Observable<Pia> {
    return this.httpPost(this.routing.all, {}, model);
  }

  public deleteById(id: any): Observable<Pia> {
    return this.httpGetOne(this.routing.one, { id: id });
  }

  public delete(model: Pia): Observable<Pia> {
    return this.deleteById(model.id);
  }

}
