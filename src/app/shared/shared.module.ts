import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';

// Locales
import localeEN from '@angular/common/locales/en';
import localeCS from '@angular/common/locales/cs';
import localeDA from '@angular/common/locales/da';
import localeDE from '@angular/common/locales/de';
import localeEL from '@angular/common/locales/el';
import localeES from '@angular/common/locales/es';
import localeET from '@angular/common/locales/et';
import localeFI from '@angular/common/locales/fi';
import localeFR from '@angular/common/locales/fr';
import localeHR from '@angular/common/locales/hr';
import localeHU from '@angular/common/locales/hu';
import localeIT from '@angular/common/locales/it';
import localeLT from '@angular/common/locales/lt';
import localeNB from '@angular/common/locales/nb';
import localeNL from '@angular/common/locales/nl';
import localePL from '@angular/common/locales/pl';
import localePT from '@angular/common/locales/pt';
import localeRO from '@angular/common/locales/ro';
import localeSL from '@angular/common/locales/sl';
import localeSV from '@angular/common/locales/sv';

registerLocaleData(localeEN, 'en');
registerLocaleData(localeCS, 'cz');
registerLocaleData(localeDA, 'dk');
registerLocaleData(localeDE, 'de');
registerLocaleData(localeEL, 'el');
registerLocaleData(localeES, 'es');
registerLocaleData(localeET, 'et');
registerLocaleData(localeFI, 'fi');
registerLocaleData(localeFR, 'fr');
registerLocaleData(localeHR, 'hr');
registerLocaleData(localeHU, 'hu');
registerLocaleData(localeIT, 'it');
registerLocaleData(localeLT, 'lt');
registerLocaleData(localeNL, 'nl');
registerLocaleData(localeNB, 'no');
registerLocaleData(localePL, 'pl');
registerLocaleData(localePT, 'pt');
registerLocaleData(localeRO, 'ro');
registerLocaleData(localeSL, 'sl');
registerLocaleData(localeSV, 'sv');

import { HeaderComponent } from './components/header/header.component';
import { PiaTranslateLoader } from '../pia-translate-loader';
import { SafeHtmlPipe, Nl2brPipe, FormatTheDate, FilterForUser } from '../tools';
import { IntrojsService } from '../services/introjs.service';
import { LanguagesService } from '../services/languages.service';
import { TranslateService } from '@ngx-translate/core/lib/translate.service';



@NgModule({
  declarations: [
    HeaderComponent,
    FormatTheDate,
    SafeHtmlPipe,
    Nl2brPipe,
    FormatTheDate,
    FilterForUser
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: PiaTranslateLoader
      }
    })
  ],
  exports: [
    TranslateModule,
    HeaderComponent,
    TranslateModule,
    SafeHtmlPipe,
    Nl2brPipe,
    FormsModule,
    FormatTheDate,
    TagInputModule,
    FilterForUser
  ],
  providers: [
    IntrojsService,
    LanguagesService,
    TranslateService
  ]
})
export class SharedModule { }
