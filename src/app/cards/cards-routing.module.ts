import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardsComponent } from 'app/cards/cards.component';
import { AuthenticationGuardService } from '@security/authentication-guard.service';
import { StructureGuardService } from 'app/services/structure-guard.service';

const routes: Routes = [
  
  
  {
  	path: 'folders',
  	component: CardsComponent,
    canActivate: [AuthenticationGuardService, StructureGuardService],
  },
  {
    path: 'folders/:id',
    component: CardsComponent,
    canActivate: [AuthenticationGuardService, StructureGuardService],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CardsRoutingModule { }
