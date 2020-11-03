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


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    PiaRoutingModule,
  ],
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
    RisksCartographyComponent
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
    RisksCartographyComponent
  ],
  providers: [
    PiaService,
    ArchiveService,
    StructureService,
    AnswerStructureService,
    MeasureService,
    ActionPlanService,
    AttachmentsService,
    RevisionService
  ]
})
export class PiaModule { }
