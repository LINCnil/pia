import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { StructureRoutingModule } from './structure-routing.module';
import { AnswerStructureService } from 'src/app/services/answer-structure.service';
import { ArchiveService } from 'src/app/services/archive.service';
import { AttachmentsService } from 'src/app/services/attachments.service';
import { MeasureService } from 'src/app/services/measures.service';
import { PiaService } from 'src/app/services/pia.service';
import { StructureService } from 'src/app/services/structure.service';
import { StructureComponent } from './structure.component';
import { SectionsComponent } from './sections/sections.component';
import { ActionPlanService } from 'src/app/services/action-plan.service';
import { ContentComponent } from './content/content.component';
import { MeasuresComponent } from './content/measures/measures.component';
import { QuestionsComponent } from './content/questions/questions.component';
import { TranslatePipe } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    StructureComponent,
    SectionsComponent,
    ContentComponent,
    MeasuresComponent,
    QuestionsComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    StructureRoutingModule,
    TranslatePipe,
    FaIconComponent
  ],
  providers: [
    PiaService,
    ArchiveService,
    StructureService,
    AnswerStructureService,
    MeasureService,
    ActionPlanService,
    AttachmentsService
  ]
})
export class StructureModule {}
