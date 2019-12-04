import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';

// Locales
import localeEN from '@angular/common/locales/en';
// import localeCZ from '@angular/common/locales/cz';
import localeDE from '@angular/common/locales/de';
// import localeDK from '@angular/common/locales/dk';
import localeEL from '@angular/common/locales/el';
import localeES from '@angular/common/locales/es';
import localeET from '@angular/common/locales/et';
import localeFI from '@angular/common/locales/fi';
import localeFR from '@angular/common/locales/fr';
import localeHR from '@angular/common/locales/hr';
import localeHU from '@angular/common/locales/hu';
import localeIT from '@angular/common/locales/it';
import localeLT from '@angular/common/locales/lt';
import localeNL from '@angular/common/locales/nl';
// import localeNO from '@angular/common/locales/no';
import localePL from '@angular/common/locales/pl';
import localePT from '@angular/common/locales/pt';
import localeRO from '@angular/common/locales/ro';
import localeSL from '@angular/common/locales/sl';
import localeSV from '@angular/common/locales/sv';

registerLocaleData(localeEN, 'en');
// registerLocaleData(localeCZ, 'cz');
registerLocaleData(localeDE, 'de');
// registerLocaleData(localeDK, 'dk');
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
// registerLocaleData(localeNO, 'no');
registerLocaleData(localePL, 'pl');
registerLocaleData(localePT, 'pt');
registerLocaleData(localeRO, 'ro');
registerLocaleData(localeSL, 'sl');
registerLocaleData(localeSV, 'sv');

import { PiaTranslateLoader } from './pia-translate-loader';

// Routing
import { AppRoutingModule } from 'src/app/app-routing.module';

// Components
import { HeaderComponent } from 'src/app/header/header.component';
import { ModalsComponent } from 'src/app/modals/modals.component';
import { KnowledgeBaseComponent } from 'src/app/entry/knowledge-base/knowledge-base.component';
import { KnowledgeBaseItemComponent } from 'src/app/entry/knowledge-base/knowledge-base-item/knowledge-base-item.component';

// Services
import { AppDataService } from 'src/app/services/app-data.service';
import { MeasureService } from 'src/app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'src/app/modals/modals.service';
import { AttachmentsService } from 'src/app/entry/attachments/attachments.service';
import { KnowledgeBaseService } from 'src/app/entry/knowledge-base/knowledge-base.service';
import { ActionPlanService } from 'src/app/entry/entry-content/action-plan/action-plan.service';
import { PaginationService } from 'src/app/entry/entry-content/pagination.service';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';

import { SafeHtmlPipe, Nl2brPipe, FormatTheDate } from './tools';

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
  FormatTheDate
];

@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
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
    FormatTheDate
  ],
  declarations: [
    HeaderComponent,
    ModalsComponent,
    KnowledgeBaseComponent,
    KnowledgeBaseItemComponent,
    SafeHtmlPipe,
    Nl2brPipe,
    FormatTheDate
  ],
  providers: providersList
})
export class SharedModule { }
