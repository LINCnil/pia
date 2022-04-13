import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { HomeModule } from './modules/home/home.module';
import { EntriesModule } from './modules/entries/entries.module';
import { BaseModule } from './modules/base/base.module';
import { StructureModule } from './modules/structure/structure.module';
import { PiaModule } from './modules/pia/pia.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { UsersModule } from './modules/users/users.module';
import { PiaI18nModule } from '@atnos/pia-i18n';

@NgModule({
  declarations: [AppComponent],
  imports: [
    SharedModule,
    PiaI18nModule,
    HomeModule,
    EntriesModule,
    BaseModule,
    StructureModule,
    PiaModule,
    SettingsModule,
    AppRoutingModule,
    UsersModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    })
  ],
  exports: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
