import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardsComponent } from 'app/cards/cards.component';
import { AuthenticationGuardService } from '@security/authentication-guard.service';

const routes: Routes = [
  {
  	path: 'home/:id',
  	component: CardsComponent,
  	canActivate: [AuthenticationGuardService]
  },
  {
  	path: 'home',
  	component: CardsComponent,
  	canActivate: [AuthenticationGuardService]
  },
  {
    path: 'folder/:id',
    component: CardsComponent,
    canActivate: [AuthenticationGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CardsRoutingModule { }
