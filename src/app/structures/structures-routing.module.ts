import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StructuresComponent } from 'app/structures/structures.component';

const routes: Routes = [
  { path: 'structures', component: StructuresComponent },
  { path: 'structures/:view', component: StructuresComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StructuresRoutingModule { }
