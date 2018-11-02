import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared.module';
import { StructuresRoutingModule } from './structures-routing.module';
import { AnswerStructureService } from 'app/services/answer-structure.service';
import { StructuresComponent } from './structures.component';
import { CardItemComponent } from './card-item/card-item.component';
import { ListItemComponent } from './list-item/list-item.component';
import { EntryComponent } from './entry/entry.component';
import { SectionsComponent } from './entry/sections/sections.component';
import { EntryContentComponent } from './entry/entry-content/entry-content.component';
import { QuestionsComponent } from './entry/entry-content/questions/questions.component';
import { MeasuresComponent } from './entry/entry-content/measures/measures.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    StructuresRoutingModule
  ],
  declarations: [
    StructuresComponent,
    CardItemComponent,
    ListItemComponent,
    EntryComponent,
    SectionsComponent,
    EntryContentComponent,
    QuestionsComponent,
    MeasuresComponent
  ],
  providers: [AnswerStructureService]
})
export class StructuresModule { }
