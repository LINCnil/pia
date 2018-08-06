import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuardService } from '@security/authentication-guard.service';
import {ProcessingResolve} from 'app/services/processing.resolve.service'; // @TODO: create ProcessingResolve
import {PiaService} from 'app/entry/pia.service';
import { PiasListComponent } from './list.component';

const routes: Routes = [{
  path: 'processings/:id/pias',
  component: PiasListComponent,
  canActivate: [AuthenticationGuardService, ProcessingResolve]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [PiaService, ProcessingResolve]
})
export class PiasListRoutingModule { }
