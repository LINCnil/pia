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
import { TemplateService } from '@api/service/template.service';
import { FolderService } from '@api/service/folder.service';
import { ProcessingService } from '@api/service/processing.service';
import { ProcessingCommentService } from '@api/service/processing-comment.service';
import { ProcessingAttachmentService } from '@api/service/processing-attachment.service';
import { StructureService } from '@api/service/structure.service';

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
    UserTokenService,
    TemplateService,
    FolderService,
    ProcessingService,
    ProcessingCommentService,
    ProcessingAttachmentService,
    StructureService
  ]
})

export class ApiModule { }
