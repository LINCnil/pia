import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardsComponent } from 'app/cards/cards.component';
import { AuthenticationGuardService } from '@security/authentication-guard.service';

const routes: Routes = [
  
  {
  	path: 'home',
    redirectTo: 'folders'
  },
  {
  	path: 'folders',
  	component: CardsComponent,
  	canActivate: [AuthenticationGuardService]
  },
  {
    path: 'folders/:id',
    component: CardsComponent,
    canActivate: [AuthenticationGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CardsRoutingModule { }
