import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntryComponent } from 'app/entry/entry.component';

const routes: Routes = [
  { path: 'entry/:id', component: EntryComponent },
  { path: 'entry/:id/section/:section_id/item/:item_id', component: EntryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntryRoutingModule { }
