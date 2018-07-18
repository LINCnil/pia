import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from 'app/dashboard/dashboard.component';
import { AuthenticationGuardService } from '@security/authentication-guard.service';

const routes: Routes = [
  
  {
  	path: 'dashboard',
  	component: DashboardComponent,
  	canActivate: [AuthenticationGuardService]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
