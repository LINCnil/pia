import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntryComponent } from 'app/entry/entry.component';
import { AuthenticationGuardService } from '@security/authentication-guard.service';
import { PiaResolve } from 'app/services/pia.resolve.service';
import { PiaService } from 'app/entry/pia.service';

const routes: Routes = [
  {
    path: 'entry/:id',
    component: EntryComponent,
    canActivate: [AuthenticationGuardService]
  },
  {
    path: 'entry/:id/section/1/item/:item_id',
    redirectTo: 'entry/:id/section/3/item/:item_id',
    pathMatch: 'full'
  },
  {
    path: 'entry/:id/section/2/item/:item_id',
    redirectTo: 'entry/:id/section/3/item/:item_id',
    pathMatch: 'full'
  },
  {
    path: 'entry/:id/section/:section_id/item/:item_id',
    component: EntryComponent,
    canActivate: [AuthenticationGuardService, PiaResolve]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [PiaService, PiaResolve]
})
export class EntryRoutingModule { }
