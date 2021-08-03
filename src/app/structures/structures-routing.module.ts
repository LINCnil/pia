import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StructuresComponent } from './structures.component';
import { EntryComponent } from './entry/entry.component';

const routes: Routes = [
  { path: 'structures', component: StructuresComponent },
  { path: 'structures/:view', component: StructuresComponent },
  { path: 'structures/entry/:structure_id', component: EntryComponent },
  { path: 'structures/entry/:structure_id/section/:section_id/item/:item_id', component: EntryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StructuresRoutingModule { }
