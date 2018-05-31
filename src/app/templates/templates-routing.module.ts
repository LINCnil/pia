import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuardService } from '@security/authentication-guard.service';
import { TemplatesComponent } from 'app/templates/templates.component';
import {TemplatesResolve} from 'app/templates/templates.resolve.service';

const routes: Routes = [
  {
    path: 'templates',
    component: TemplatesComponent,
    canActivate: [AuthenticationGuardService],
    resolve: { templates: TemplatesResolve }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [TemplatesResolve]
})
export class TemplatesRoutingModule { }
