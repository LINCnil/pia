import {
  RollbarService,
  RollbarErrorHandler,
  rollbarFactory,
} from 'app/rollbar';
import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';
import { Angular2CsvModule } from 'angular2-csv';
import { CsvModule } from './summary/csv.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
library.add(fas, far);
// Routing
import { AppRoutingModule } from 'app/app-routing.module';

// Components
import { HeaderComponent } from 'app/header/header.component';
import { ModalsComponent } from 'app/modals/modals.component';
import { KnowledgeBaseComponent } from 'app/entry/knowledge-base/knowledge-base.component';
import { KnowledgeBaseItemComponent } from 'app/entry/knowledge-base/knowledge-base-item/knowledge-base-item.component';

// Services
import { AppDataService } from 'app/services/app-data.service';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'app/modals/modals.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';
import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { ActionPlanService } from 'app/entry/entry-content/action-plan/action-plan.service';
import { PaginationService } from 'app/entry/entry-content/pagination.service';
import { SidStatusService } from 'app/services/sid-status.service';
import { LanguagesService } from 'app/services/languages.service';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';

import { SafeHtmlPipe, Nl2brPipe } from './tools';

// Locales
import localeCS from '@angular/common/locales/cs';
import localeDE from '@angular/common/locales/de';
import localeDA from '@angular/common/locales/da';
import localeEL from '@angular/common/locales/el';
import localeEN from '@angular/common/locales/en';
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

registerLocaleData(localeCS);
registerLocaleData(localeDE);
registerLocaleData(localeDA);
registerLocaleData(localeEL);
registerLocaleData(localeEN);
registerLocaleData(localeES);
registerLocaleData(localeET);
registerLocaleData(localeFI);
registerLocaleData(localeFR);
registerLocaleData(localeHR);
registerLocaleData(localeHU);
registerLocaleData(localeIT);
registerLocaleData(localeLT);
registerLocaleData(localeNB);
registerLocaleData(localeNL);
registerLocaleData(localePL);
registerLocaleData(localePT);
registerLocaleData(localeRO);

const providersList: any = [
  AppDataService,
  MeasureService,
  ModalsService,
  AttachmentsService,
  KnowledgeBaseService,
  ActionPlanService,
  PaginationService,
  SidStatusService,
  LanguagesService,
  GlobalEvaluationService,
];

if (environment.rollbar_key.length > 0) {
  providersList.push(
    {
      provide: ErrorHandler,
      useClass: RollbarErrorHandler,
    },
    {
      provide: RollbarService,
      useFactory: rollbarFactory,
    }
  );
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    // TagInputModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [
    HeaderComponent,
    ModalsComponent,
    KnowledgeBaseComponent,
    KnowledgeBaseItemComponent,
    TranslateModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SafeHtmlPipe,
    Nl2brPipe,
    TagInputModule,
    Angular2CsvModule,
    CsvModule,
    PdfViewerModule,
  ],
  declarations: [
    HeaderComponent,
    ModalsComponent,
    KnowledgeBaseComponent,
    KnowledgeBaseItemComponent,
    SafeHtmlPipe,
    Nl2brPipe,
  ],
  providers: providersList,
})
export class SharedModule {}
