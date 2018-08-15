import { RollbarService, RollbarErrorHandler, rollbarFactory } from 'app/rollbar';

import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { HttpModule } from '@angular/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Routing
import { AppRoutingModule } from 'app/app-routing.module';

// Components
import { HeaderComponent } from 'app/header/header.component';
import { ModalsComponent } from 'app/modals/modals.component';

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

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

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
  GlobalEvaluationService
];

if (environment.rollbar_key.length > 0) {
  providersList.push(
    {
      provide: ErrorHandler,
      useClass: RollbarErrorHandler
    },
    {
      provide: RollbarService,
      useFactory: rollbarFactory
    }
  );
}

@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule,
    HttpModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  exports: [
    HeaderComponent,
    ModalsComponent,
    TranslateModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    HeaderComponent,
    ModalsComponent
  ],
  providers: providersList
})
export class SharedModule { }
