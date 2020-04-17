import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared.module';
import { KnowledgesRoutingModule } from './knowledges-routing.module';
import { CardComponent } from './card/card.component';
import { ListItemComponent } from './list-item/list-item.component';
import { IndexComponent } from './index/index.component';
import { EntryComponent } from './entry/entry.component';

@NgModule({
  imports: [SharedModule, CommonModule, KnowledgesRoutingModule],
  declarations: [IndexComponent, CardComponent, ListItemComponent, EntryComponent],
  providers: []
})
export class KnowledgesModule {}
