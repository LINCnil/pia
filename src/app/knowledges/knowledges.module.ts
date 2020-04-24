import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared.module';
import { KnowledgesRoutingModule } from './knowledges-routing.module';
import { CardComponent } from './card/card.component';
import { ListItemComponent } from './list-item/list-item.component';
import { IndexComponent } from './index/index.component';
import { BaseComponent } from './base/base.component';
import { EntryComponent } from './entry/entry.component';
import { HighlightDirective } from './base/base.directive';

@NgModule({
  imports: [SharedModule, CommonModule, KnowledgesRoutingModule],
  declarations: [IndexComponent, CardComponent, ListItemComponent, EntryComponent, BaseComponent, HighlightDirective],
  providers: []
})
export class KnowledgesModule {}
