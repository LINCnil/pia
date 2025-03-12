import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PiaComponent } from './pia.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PiaRoutingModule } from './pia-routing.module';
import { RevisionService } from 'src/app/services/revision.service';
import { AnswerService } from 'src/app/services/answer.service';
import { ActionPlanService } from 'src/app/services/action-plan.service';
import { AnswerStructureService } from 'src/app/services/answer-structure.service';
import { ArchiveService } from 'src/app/services/archive.service';
import { AttachmentsService } from 'src/app/services/attachments.service';
import { MeasureService } from 'src/app/services/measures.service';
import { PiaService } from 'src/app/services/pia.service';
import { StructureService } from 'src/app/services/structure.service';
import { RevisionsComponent } from './revisions/revisions.component';
import { RevisionPreviewComponent } from './revisions/revision-preview/revision-preview.component';
import { SectionsComponent } from './sections/sections.component';
import { AttachmentsComponent } from './attachments/attachments.component';
import { AttachmentItemComponent } from './attachments/attachment-item/attachment-item.component';
import { ExportComponent } from './export/export.component';
import { PreviewComponent } from './preview/preview.component';
import { ContentComponent } from './content/content.component';
import { OverviewRisksComponent } from './content/overview-risks/overview-risks.component';
import { RisksCartographyComponent } from './content/risks-cartography/risks-cartography.component';
import { ActionPlanComponent } from './content/action-plan/action-plan.component';
import { ActionPlanImplementationComponent } from './content/action-plan/action-plan-implementation/action-plan-implementation.component';
import { EvaluationsComponent } from './content/evaluations/evaluations.component';
import { MeasuresComponent } from './content/measures/measures.component';
import { QuestionsComponent } from './content/questions/questions.component';
import { ValidatePIAComponent } from './content/validate-pia/validate-pia.component';
import { DPOPeopleOpinionsComponent } from './content/dpo-people-opinions/dpo-people-opinions.component';
import { RefusePIAComponent } from './content/refuse-pia/refuse-pia.component';
import { CommentsComponent } from './content/comments/comments.component';
import { PiaValidateHistoryComponent } from './content/validate-pia/pia-validate-history/pia-validate-history.component';
import { ExampleComponent } from './example/example.component';
import { CommentItemComponent } from './content/comments/comment-item/comment-item.component';
import { CommentsService } from 'src/app/services/comments.service';
import { EvaluationService } from 'src/app/services/evaluation.service';
import { TranslatePipe } from '@ngx-translate/core';

@NgModule({
  imports: [SharedModule, CommonModule, PiaRoutingModule, TranslatePipe],
  declarations: [
    PiaComponent,
    RevisionsComponent,
    RevisionPreviewComponent,
    SectionsComponent,
    AttachmentsComponent,
    AttachmentItemComponent,
    ExportComponent,
    PreviewComponent,
    ContentComponent,
    OverviewRisksComponent,
    RisksCartographyComponent,
    ActionPlanComponent,
    ActionPlanImplementationComponent,
    EvaluationsComponent,
    MeasuresComponent,
    QuestionsComponent,
    ValidatePIAComponent,
    DPOPeopleOpinionsComponent,
    RefusePIAComponent,
    CommentsComponent,
    CommentItemComponent,
    PiaValidateHistoryComponent,
    ExampleComponent
  ],
  exports: [
    PiaComponent,
    RevisionsComponent,
    RevisionPreviewComponent,
    SectionsComponent,
    AttachmentsComponent,
    AttachmentItemComponent,
    ExportComponent,
    PreviewComponent,
    OverviewRisksComponent,
    RisksCartographyComponent,
    ActionPlanComponent,
    ActionPlanImplementationComponent
  ],
  providers: [
    PiaService,
    ArchiveService,
    StructureService,
    AnswerStructureService,
    MeasureService,
    ActionPlanService,
    AttachmentsService,
    RevisionService,
    CommentsService,
    EvaluationService
  ]
})
export class PiaModule {}
