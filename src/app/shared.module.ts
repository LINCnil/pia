import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';

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

import { SafeHtmlPipe, Nl2brPipe } from './tools';

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
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
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
    TagInputModule
  ],
  declarations: [
    HeaderComponent,
    ModalsComponent,
    KnowledgeBaseComponent,
    KnowledgeBaseItemComponent,
    SafeHtmlPipe,
    Nl2brPipe
  ],
  providers: providersList
})
export class SharedModule { }
