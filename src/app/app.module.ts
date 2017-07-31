import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

import { TagInputModule } from 'ngx-chips';

import { HeaderComponent } from './header/header.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { CardsComponent } from './cards/cards.component';
import { CardItemComponent } from './cards/card-item/card-item.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { EntryComponent } from './entry/entry.component';
import { SectionsComponent } from './entry/sections/sections.component';
import { AttachmentsComponent } from './entry/attachments/attachments.component';
import { EntryContentComponent } from './entry/entry-content/entry-content.component';
import { KnowledgeBaseComponent } from './entry/knowledge-base/knowledge-base.component';
import { KnowledgeBaseItemComponent } from './entry/knowledge-base/knowledge-base-item/knowledge-base-item.component';
import { AttachmentItemComponent } from './entry/attachments/attachment-item/attachment-item.component';
import { CommentsComponent } from './entry/entry-content/comments/comments.component';
import { CommentItemComponent } from './entry/entry-content/comments/comment-item/comment-item.component';
import { EvaluationsComponent } from './entry/entry-content/evaluations/evaluations.component';
import { QuestionsComponent } from './entry/entry-content/questions/questions.component';
import { RisksCartographyComponent } from './entry/entry-content/risks-cartography/risks-cartography.component';
import { ActionPlanComponent } from './entry/entry-content/action-plan/action-plan.component';
import { ActionPlanGraphComponent } from './entry/entry-content/action-plan/action-plan-graph/action-plan-graph.component';
import { DPOPeopleOpinionsComponent } from './entry/entry-content/dpo-people-opinions/dpo-people-opinions.component';
import { ValidatePIAComponent } from './entry/entry-content/validate-pia/validate-pia.component';
import { RefusePIAComponent } from './entry/entry-content/refuse-pia/refuse-pia.component';
import { PiaValidateHistoryComponent } from './entry/entry-content/validate-pia/pia-validate-history/pia-validate-history.component';
import { SettingsComponent } from './settings/settings.component';
import { HelpComponent } from './help/help.component';
import { ModalsComponent } from './modals/modals.component';
import { MeasuresComponent } from './entry/entry-content/measures/measures.component';
import { CardFilterComponent } from './cards/card-filter/card-filter.component';
import { MeasureService } from './entry/entry-content/measures/measures.service';
import { ModalsService } from './modals/modals.service';

const appRoutes: Routes = [
  { path: '', component: AuthenticationComponent },
  { path: 'home', component: CardsComponent },
  { path: 'entry/:id', component: EntryComponent },
  { path: 'entry/:id/section/:section_id/item/:item_id', component: EntryComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'help', component: HelpComponent }
];

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
    ActionPlanGraphComponent,
    ValidatePIAComponent,
    RefusePIAComponent,
    PiaValidateHistoryComponent,
    SettingsComponent,
    HelpComponent,
    ModalsComponent,
    MeasuresComponent,
    CardFilterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    TagInputModule
  ],
  providers: [MeasureService, ModalsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
