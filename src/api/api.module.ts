import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AnswerService } from '@api/service/answer.service';
import { AttachmentService } from '@api/service/attachment.service';
import { CommentService } from '@api/service/comment.service';
import { EvaluationService } from '@api/service/evaluation.service';
import { MeasureService } from '@api/service/measure.service';
import { PiaService } from '@api/service/pia.service';

@NgModule({
  declarations: [],
  imports: [
    HttpModule
  ],
  providers: [
    AnswerService,
    AttachmentService,
    CommentService,
    EvaluationService,
    MeasureService,
    PiaService
  ]
})

export class ApiModule { }
