import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { CardsComponent } from './cards/cards.component';
import { FiltersComponent } from './filters/filters.component';
import { CardItemComponent } from './cards/card-item/card-item.component';
import { SidebarRightComponent } from './sidebar-right/sidebar-right.component';
import { EntryComponent } from './entry/entry.component';
import { SidebarLeftComponent } from './sidebar-left/sidebar-left.component';

const appRoutes: Routes = [
  { path: '', component: AuthenticationComponent },
  { path: 'home', component: CardsComponent },
  { path: 'entry/:id', component: EntryComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AuthenticationComponent,
    CardsComponent,
    FiltersComponent,
    CardItemComponent,
    SidebarRightComponent,
    EntryComponent,
    SidebarLeftComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
