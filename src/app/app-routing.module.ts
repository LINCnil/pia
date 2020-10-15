import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntriesComponent } from './modules/entries/entries.component';
import { EntriesModule } from './modules/entries/entries.module';
import { HomeRoutingModule } from './modules/home/home-routing.module';
import { HomeComponent } from './modules/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'entries',
    component: EntriesComponent
  }
];

@NgModule({
  imports: [
    HomeRoutingModule,
    EntriesModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
