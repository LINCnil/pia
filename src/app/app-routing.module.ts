import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BaseRoutingModule } from './modules/base/base-routing.module';
import { EntriesRoutingModule } from './modules/entries/entries-routing.module';
import { EntriesComponent } from './modules/entries/entries.component';
import { HomeRoutingModule } from './modules/home/home-routing.module';
import { HomeComponent } from './modules/home/home.component';
import { PiaRoutingModule } from './modules/pia/pia-routing.module';
import { SettingsRoutingModule } from './modules/settings/settings-routing.module';
import { StructureRoutingModule } from './modules/structure/structure-routing.module';

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
    EntriesRoutingModule,
    BaseRoutingModule,
    StructureRoutingModule,
    PiaRoutingModule,
    SettingsRoutingModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
