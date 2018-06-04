import { NgModule } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
  TranslateCompiler,
  TranslateFakeCompiler,
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';

import translations from 'assets/i18n/fr.json';

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return Observable.of(translations);
  }
}

@NgModule({
  declarations: [],
  imports: [
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useClass: FakeLoader },
      compiler: { provide: TranslateCompiler, useClass: TranslateFakeCompiler },
    })
  ],
  providers:[TranslateService],
  exports: [TranslateModule]
})

export class TranslateTestingModule { }
