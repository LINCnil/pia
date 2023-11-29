import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BaseRoutingModule } from './modules/base/base-routing.module';
import { EntriesRoutingModule } from './modules/entries/entries-routing.module';
import { HomeRoutingModule } from './modules/home/home-routing.module';
import { HomeComponent } from './modules/home/home.component';
import { PiaRoutingModule } from './modules/pia/pia-routing.module';
import { SettingsRoutingModule } from './modules/settings/settings-routing.module';
import { StructureRoutingModule } from './modules/structure/structure-routing.module';
import { UsersRoutingModule } from './modules/users/users-routing.module';
import { AuthGuard } from './shared/guards/auth.guards';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
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
    UsersRoutingModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
