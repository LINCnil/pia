import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardsComponent } from 'app/cards/cards.component';

const routes: Routes = [
  { path: 'home', component: CardsComponent },
  { path: 'home/:view', component: CardsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CardsRoutingModule { }
