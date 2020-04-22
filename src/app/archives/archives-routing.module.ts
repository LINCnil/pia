import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArchivesComponent } from './archives.component';
/* import { EntryComponent } from './entry/entry.component'; */

const routes: Routes = [
  { path: 'archives', component: ArchivesComponent },
  { path: 'archives/:view', component: ArchivesComponent }
  /* { path: 'archives/entry/:structure_id', component: EntryComponent },
  { path: 'archives/entry/:structure_id/section/:section_id/item/:item_id', component: EntryComponent }, */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArchivesRoutingModule { }
