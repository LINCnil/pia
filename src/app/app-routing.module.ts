import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationComponent } from 'app/authentication/authentication.component';
import { EntryComponent } from 'app/entry/entry.component';
import { SummaryComponent } from 'app/summary/summary.component';
import { SettingsComponent } from 'app/settings/settings.component';
import { HelpComponent } from 'app/help/help.component';
import { AboutComponent } from 'app/about/about.component';
import { ErrorsComponent } from 'app/errors/errors.component';
import { CardsRoutingModule } from 'app/cards/cards-routing.module';

const routes: Routes = [
  { path: '', component: AuthenticationComponent },
  { path: 'entry/:id', component: EntryComponent },
  { path: 'summary/:id/:type', component: SummaryComponent },
  { path: 'entry/:id/section/:section_id/item/:item_id', component: EntryComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'help', component: HelpComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', component: ErrorsComponent }
];

@NgModule({
  imports: [
    CardsRoutingModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
