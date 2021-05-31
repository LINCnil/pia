import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EntriesComponent } from './entries.component';

@NgModule({
  imports: [RouterModule.forChild([
    { path: 'entries', component: EntriesComponent },
    { path: 'entries/archive', component: EntriesComponent },
    { path: 'entries/structure', component: EntriesComponent },
    { path: 'entries/knowledgebase', component: EntriesComponent },
  ])],
  exports: [RouterModule]
})
export class EntriesRoutingModule { }
