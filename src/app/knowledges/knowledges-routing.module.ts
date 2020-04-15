import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
// import { EntryComponent } from './entry/entry.component';

const routes: Routes = [
  { path: 'knowledges', component: ListComponent }
  /*{ path: 'structures/:view', component: StructuresComponent },
  { path: 'structures/entry/:structure_id', component: EntryComponent },
  { path: 'structures/entry/:structure_id/section/:section_id/item/:item_id', component: EntryComponent }, */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KnowledgesRoutingModule {}
