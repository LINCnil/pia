import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared.module';
import { ArchivesRoutingModule } from './archives-routing.module';
import { ArchivesComponent } from './archives.component';
import { CardItemComponent } from './card-item/card-item.component';
import { ListItemComponent } from './list-item/list-item.component';
/* import { EntryComponent } from './entry/entry.component'; */
/* import { SectionsComponent } from './entry/sections/sections.component'; */
/* import { EntryContentComponent } from './entry/entry-content/entry-content.component'; */
/* import { QuestionsComponent } from './entry/entry-content/questions/questions.component'; */
/* import { MeasuresComponent } from './entry/entry-content/measures/measures.component'; */

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    ArchivesRoutingModule
  ],
  declarations: [
    ArchivesComponent,
    CardItemComponent,
    ListItemComponent
    /* EntryComponent,
    SectionsComponent,
    EntryContentComponent,
    QuestionsComponent,
    MeasuresComponent */
  ],
  providers: []
})
export class ArchivesModule { }
