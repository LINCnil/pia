import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { PiaService } from '@api/service/pia.service';
import { EvaluationService } from '@api/service/evaluation.service';
import { AnswerService } from '@api/service/answer.service';


@NgModule({
  declarations: [],
  imports: [
    HttpModule
  ],
  providers: [
    PiaService,
    EvaluationService,
    AnswerService
  ]
})

export class ApiModule { }
