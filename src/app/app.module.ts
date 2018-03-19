import { RollbarService, RollbarErrorHandler, rollbarFactory } from 'app/rollbar';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppComponent, SafeHtmlPipe, Nl2brPipe } from 'app/app.component';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppDataService } from 'app/services/app-data.service';
import { HeaderComponent } from 'app/header/header.component';
import { AuthenticationComponent } from 'app/authentication/authentication.component';
import { CardsComponent } from 'app/cards/cards.component';
import { CardItemComponent } from 'app/cards/card-item/card-item.component';
import { EntryComponent } from 'app/entry/entry.component';
import { SectionsComponent } from 'app/entry/sections/sections.component';
import { SidStatusService } from 'app/services/sid-status.service';
import { AttachmentsComponent } from 'app/entry/attachments/attachments.component';
import { EntryContentComponent } from 'app/entry/entry-content/entry-content.component';
import { KnowledgeBaseComponent } from 'app/entry/knowledge-base/knowledge-base.component';
import { KnowledgeBaseItemComponent } from 'app/entry/knowledge-base/knowledge-base-item/knowledge-base-item.component';
import { AttachmentItemComponent } from 'app/entry/attachments/attachment-item/attachment-item.component';
import { CommentsComponent } from 'app/entry/entry-content/comments/comments.component';
import { CommentItemComponent } from 'app/entry/entry-content/comments/comment-item/comment-item.component';
import { EvaluationsComponent } from 'app/entry/entry-content/evaluations/evaluations.component';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';
import { QuestionsComponent } from 'app/entry/entry-content/questions/questions.component';
import { RisksCartographyComponent } from 'app/entry/entry-content/risks-cartography/risks-cartography.component';
import { ActionPlanComponent } from 'app/entry/entry-content/action-plan/action-plan.component';
import { ActionPlanService } from 'app/entry/entry-content/action-plan/action-plan.service';
import { DPOPeopleOpinionsComponent } from 'app/entry/entry-content/dpo-people-opinions/dpo-people-opinions.component';
import { ValidatePIAComponent } from 'app/entry/entry-content/validate-pia/validate-pia.component';
import { RefusePIAComponent } from 'app/entry/entry-content/refuse-pia/refuse-pia.component';
import { PiaValidateHistoryComponent } from 'app/entry/entry-content/validate-pia/pia-validate-history/pia-validate-history.component';
import { SettingsComponent } from 'app/settings/settings.component';
import { HelpComponent } from 'app/help/help.component';
import { ModalsComponent } from 'app/modals/modals.component';
import { MeasuresComponent } from 'app/entry/entry-content/measures/measures.component';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'app/modals/modals.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';
import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { PaginationService } from 'app/entry/entry-content/pagination.service';
import { LanguagesService } from 'app/services/languages.service';
import { OverviewRisksComponent } from 'app/entry/entry-content/overview-risks/overview-risks.component';
import { ErrorsComponent } from 'app/errors/errors.component';
import {
    ActionPlanImplementationComponent
  } from 'app/entry/entry-content/action-plan/action-plan-implementation/action-plan-implementation.component';
import { environment } from '../environments/environment';
import { ListItemComponent } from 'app/cards/list-item/list-item.component';
import { SummaryComponent } from 'app/summary/summary.component';
import { AboutComponent } from 'app/about/about.component';
import { AppRoutingModule } from 'app/app-routing.module';
import { CardsRoutingModule } from 'app/cards/cards-routing.module';

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

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AuthenticationComponent,
    CardsComponent,
    CardItemComponent,
    EntryComponent,
    SectionsComponent,
    AttachmentsComponent,
    EntryContentComponent,
    KnowledgeBaseComponent,
    KnowledgeBaseItemComponent,
    AttachmentItemComponent,
    CommentsComponent,
    CommentItemComponent,
    EvaluationsComponent,
    QuestionsComponent,
    RisksCartographyComponent,
    ActionPlanComponent,
    DPOPeopleOpinionsComponent,
    ValidatePIAComponent,
    RefusePIAComponent,
    PiaValidateHistoryComponent,
    SettingsComponent,
    HelpComponent,
    ModalsComponent,
    MeasuresComponent,
    OverviewRisksComponent,
    ErrorsComponent,
    ActionPlanImplementationComponent,
    ListItemComponent,
    SummaryComponent,
    SafeHtmlPipe,
    Nl2brPipe,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    BrowserAnimationsModule,
    TagInputModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  exports: [],
  providers: providersList,
  bootstrap: [AppComponent]
})
export class AppModule { }
