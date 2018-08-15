import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent, SafeHtmlPipe, Nl2brPipe } from 'app/app.component';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Modules
import { SharedModule } from './shared.module';

// Components
import { AuthenticationComponent } from 'app/authentication/authentication.component';
import { CardsComponent } from 'app/cards/cards.component';
import { CardItemComponent } from 'app/cards/card-item/card-item.component';
import { EntryComponent } from 'app/entry/entry.component';
import { SectionsComponent } from 'app/entry/sections/sections.component';
import { AttachmentsComponent } from 'app/entry/attachments/attachments.component';
import { EntryContentComponent } from 'app/entry/entry-content/entry-content.component';
import { KnowledgeBaseComponent } from 'app/entry/knowledge-base/knowledge-base.component';
import { KnowledgeBaseItemComponent } from 'app/entry/knowledge-base/knowledge-base-item/knowledge-base-item.component';
import { AttachmentItemComponent } from 'app/entry/attachments/attachment-item/attachment-item.component';
import { CommentsComponent } from 'app/entry/entry-content/comments/comments.component';
import { CommentItemComponent } from 'app/entry/entry-content/comments/comment-item/comment-item.component';
import { EvaluationsComponent } from 'app/entry/entry-content/evaluations/evaluations.component';
import { QuestionsComponent } from 'app/entry/entry-content/questions/questions.component';
import { RisksCartographyComponent } from 'app/entry/entry-content/risks-cartography/risks-cartography.component';
import { ActionPlanComponent } from 'app/entry/entry-content/action-plan/action-plan.component';
import { DPOPeopleOpinionsComponent } from 'app/entry/entry-content/dpo-people-opinions/dpo-people-opinions.component';
import { ValidatePIAComponent } from 'app/entry/entry-content/validate-pia/validate-pia.component';
import { RefusePIAComponent } from 'app/entry/entry-content/refuse-pia/refuse-pia.component';
import { PiaValidateHistoryComponent } from 'app/entry/entry-content/validate-pia/pia-validate-history/pia-validate-history.component';
import { SettingsComponent } from 'app/settings/settings.component';
import { HelpComponent } from 'app/help/help.component';
import { MeasuresComponent } from 'app/entry/entry-content/measures/measures.component';
import { OverviewRisksComponent } from 'app/entry/entry-content/overview-risks/overview-risks.component';
import { ErrorsComponent } from 'app/errors/errors.component';
import {
    ActionPlanImplementationComponent
  } from 'app/entry/entry-content/action-plan/action-plan-implementation/action-plan-implementation.component';
import { ListItemComponent } from 'app/cards/list-item/list-item.component';
import { SummaryComponent } from 'app/summary/summary.component';
import { AboutComponent } from 'app/about/about.component';
import { StructuresModule } from 'app/structures/structures.module';

@NgModule({
  declarations: [
    AppComponent,
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
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    TagInputModule,
    StructuresModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
