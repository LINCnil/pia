import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { EntryComponent } from './entry/entry.component';
import { BaseComponent } from './base/base.component';

const routes: Routes = [
  { path: 'knowledges', component: IndexComponent },
  { path: 'knowledges/:view', component: IndexComponent },
  { path: 'knowledges/base/:id', component: BaseComponent }
  //{ path: 'structures/entry/:structure_id/section/:section_id/item/:item_id', component: EntryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KnowledgesRoutingModule {}
