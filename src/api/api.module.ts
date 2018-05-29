import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AnswerService } from '@api/service/answer.service';
import { AttachmentService } from '@api/service/attachment.service';
import { CommentService } from '@api/service/comment.service';
import { EvaluationService } from '@api/service/evaluation.service';
import { MeasureService } from '@api/service/measure.service';
import { PiaService } from '@api/service/pia.service';
import { UserProfileService } from '@api/service/user-profile.service';
import { UserTokenService } from '@api/service/user-token.service';

@NgModule({
  declarations: [],
  imports: [
    HttpClientModule
  ],
  providers: [
    AnswerService,
    AttachmentService,
    CommentService,
    EvaluationService,
    MeasureService,
    PiaService,
    UserProfileService,
    UserTokenService
  ]
})

export class ApiModule { }
