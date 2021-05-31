import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntriesComponent } from './entries.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { EntriesRoutingModule } from './entries-routing.module';
import { PiaService } from 'src/app/services/pia.service';
import { StructureService } from 'src/app/services/structure.service';
import { AnswerStructureService } from 'src/app/services/answer-structure.service';
import { MeasureService } from 'src/app/services/measures.service';
import { AttachmentsService } from 'src/app/services/attachments.service';
import { NewPiaComponent } from './forms/new-pia/new-pia.component';
import { PiaCardComponent } from './cards/pia-card/pia-card.component';
import { PiaLineComponent } from './list/pia-line/pia-line.component';
import { ArchiveService } from 'src/app/services/archive.service';
import { ArchiveCardComponent } from './cards/archive-card/archive-card.component';
import { ArchiveLineComponent } from './list/archive-line/archive-line.component';
import { StructureCardComponent } from './cards/structure-card/structure-card.component';
import { NewStructureComponent } from './forms/new-structure/new-structure.component';
import { KnowledgebaseCardComponent } from './cards/knowledgebase-card/knowledgebase-card.component';
import { NewKnowledgebaseComponent } from './forms/new-knowledgebase/new-knowledgebase.component';
import { KnowledgebaseLineComponent } from './list/knowledgebase-line/knowledgebase-line.component';
import { StructureLineComponent } from './list/structure-line/structure-line.component';
import { PiaHeadingComponent } from './list/heading/pia-heading/pia-heading.component';
import { StructureHeadingComponent } from './list/heading/structure-heading/structure-heading.component';
import { KnowledgebaseHeadingComponent } from './list/heading/knowledgebase-heading/knowledgebase-heading.component';
import { EvaluationService } from 'src/app/services/evaluation.service';
import { PiaI18nModule } from '@atnos/pia-i18n';

@NgModule({
  declarations: [
    EntriesComponent,
    NewPiaComponent,
    PiaCardComponent,
    PiaLineComponent,
    ArchiveCardComponent,
    ArchiveLineComponent,
    StructureCardComponent,
    NewStructureComponent,
    KnowledgebaseCardComponent,
    NewKnowledgebaseComponent,
    KnowledgebaseLineComponent,
    StructureLineComponent,
    PiaHeadingComponent,
    StructureHeadingComponent,
    KnowledgebaseHeadingComponent
  ],
  imports: [SharedModule, PiaI18nModule, CommonModule, EntriesRoutingModule],
  providers: [
    PiaService,
    ArchiveService,
    StructureService,
    AnswerStructureService,
    MeasureService,
    AttachmentsService,
    EvaluationService
  ]
})
export class EntriesModule {}
