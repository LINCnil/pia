import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntryComponent } from 'app/entry/entry.component';
import { AuthenticationGuardService } from 'app/services/authentication-guard.service';


const routes: Routes = [
  { 
  	path: 'entry/:id',
  	component: EntryComponent,
  	canActivate: [AuthenticationGuardService] 
  },
  {
  	path: 'entry/:id/section/:section_id/item/:item_id',
  	component: EntryComponent,
  	canActivate: [AuthenticationGuardService] 
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntryRoutingModule { }
