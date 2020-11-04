import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { HomeModule } from './modules/home/home.module';
import { EntriesModule } from './modules/entries/entries.module';
import { BaseModule } from './modules/base/base.module';
import { StructureModule } from './modules/structure/structure.module';
import { PiaRoutingModule } from './modules/pia/pia-routing.module';
import { PiaModule } from './modules/pia/pia.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    SharedModule,
    BrowserModule,
    HomeModule,
    EntriesModule,
    BaseModule,
    StructureModule,
    PiaModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
