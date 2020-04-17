import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { KnowledgeEntryComponent } from './knowledge-entry/knowledge-entry.component';

const routes: Routes = [
  { path: 'knowledges', component: IndexComponent },
  { path: 'knowledges/:view', component: IndexComponent },
  { path: 'knowledges/entry/:id', component: KnowledgeEntryComponent }
  //{ path: 'structures/entry/:structure_id/section/:section_id/item/:item_id', component: EntryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KnowledgesRoutingModule {}
