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
import { PiaItemComponent } from './cards/pia-item/pia-item.component';



@NgModule({
  declarations: [EntriesComponent, NewPiaComponent, PiaItemComponent],
  imports: [
    SharedModule,
    CommonModule,
    EntriesRoutingModule
  ],
  providers: [
    PiaService,
    StructureService,
    AnswerStructureService,
    MeasureService,
    AttachmentsService ]
})
export class EntriesModule { }
