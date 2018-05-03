import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardsComponent } from 'app/cards/cards.component';
import { AuthenticationGuardService } from 'app/services/authentication-guard.service';

const routes: Routes = [
  {
  	path: 'home',
  	component: CardsComponent,
  	canActivate: [AuthenticationGuardService]
  },
  {
  	path: 'home/:view',
  	component: CardsComponent,
  	canActivate: [AuthenticationGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CardsRoutingModule { }
