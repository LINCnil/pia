import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Import localization data for supported languages
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import localeDe from '@angular/common/locales/de';
import localeIt from '@angular/common/locales/it';
import localeEs from '@angular/common/locales/es';
import localePt from '@angular/common/locales/pt';
import localeNl from '@angular/common/locales/nl';
import localeFi from '@angular/common/locales/fi';
import localeHu from '@angular/common/locales/hu';
import localeNo from '@angular/common/locales/no';
import localePl from '@angular/common/locales/pl';
import localeSl from '@angular/common/locales/sl';
import localeSv from '@angular/common/locales/sv';
import localeDa from '@angular/common/locales/da';
import localeEl from '@angular/common/locales/el';
import localeHr from '@angular/common/locales/hr';
import localeLt from '@angular/common/locales/lt';
import localeLv from '@angular/common/locales/lv';
import localeRo from '@angular/common/locales/ro';
import localeBg from '@angular/common/locales/bg';
import localeCs from '@angular/common/locales/cs';
import localeEt from '@angular/common/locales/et';

// Register all locales
registerLocaleData(localeFr);
registerLocaleData(localeEn);
registerLocaleData(localeDe);
registerLocaleData(localeIt);
registerLocaleData(localeEs);
registerLocaleData(localePt);
registerLocaleData(localeNl);
registerLocaleData(localeFi);
registerLocaleData(localeHu);
registerLocaleData(localeNo);
registerLocaleData(localePl);
registerLocaleData(localeSl);
registerLocaleData(localeSv);
registerLocaleData(localeDa);
registerLocaleData(localeEl);
registerLocaleData(localeHr);
registerLocaleData(localeLt);
registerLocaleData(localeLv);
registerLocaleData(localeRo);
registerLocaleData(localeBg);
registerLocaleData(localeCs);
registerLocaleData(localeEt);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
