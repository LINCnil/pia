import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared.module';
import { ArchivesRoutingModule } from './archives-routing.module';
import { ArchivesComponent } from './archives.component';
import { CardItemComponent } from './card-item/card-item.component';
import { ListItemComponent } from './list-item/list-item.component';

@NgModule({
  imports: [SharedModule, CommonModule, ArchivesRoutingModule],
  declarations: [ArchivesComponent, CardItemComponent, ListItemComponent],
  providers: []
})
export class ArchivesModule {}
