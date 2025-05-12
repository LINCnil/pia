import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// import ngx-translate and the http loader
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

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

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    SharedModule,
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
  providers: [provideHttpClient(withInterceptorsFromDi())],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
