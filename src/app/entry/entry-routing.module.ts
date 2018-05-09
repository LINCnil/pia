import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntryComponent } from 'app/entry/entry.component';
import { AuthenticationGuardService } from 'app/services/authentication-guard.service';
import { AuthorizationGuardService } from 'app/services/authorization-guard.service';

const routes: Routes = [
  {
  	path: 'entry/:id',
  	component: EntryComponent,
  	canActivate: [AuthenticationGuardService, AuthorizationGuardService],
    data: {
      roles: ['admin']
    }
  },
  {
  	path: 'entry/:id/section/:section_id/item/:item_id',
  	component: EntryComponent,
  	canActivate: [AuthenticationGuardService, AuthorizationGuardService],
    data: {
      roles: ['admin']
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntryRoutingModule { }
