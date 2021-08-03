import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthenticationComponent } from './authentication/authentication.component';
import { PreviewComponent } from './preview/preview.component';
import { SettingsComponent } from './settings/settings.component';
import { HelpComponent } from './help/help.component';
import { AboutComponent } from './about/about.component';
import { ErrorsComponent } from './errors/errors.component';

import { CardsRoutingModule } from './cards/cards-routing.module';
import { EntryRoutingModule } from './entry/entry-routing.module';
import { StructuresRoutingModule } from './structures/structures-routing.module';
import { ArchivesRoutingModule } from './archives/archives-routing.module';

const routes: Routes = [
  { path: '', component: AuthenticationComponent },
  { path: 'preview/:id', component: PreviewComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'help', component: HelpComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', component: ErrorsComponent }
];

@NgModule({
  imports: [
    CardsRoutingModule,
    EntryRoutingModule,
    StructuresRoutingModule,
    ArchivesRoutingModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
