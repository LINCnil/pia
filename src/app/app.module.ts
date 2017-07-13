import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { CardsComponent } from './cards/cards.component';
import { FiltersComponent } from './filters/filters.component';
import { CardItemComponent } from './cards/card-item/card-item.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { EntryComponent } from './entry/entry.component';
import { SectionsComponent } from './entry/sections/sections.component';
import { AttachmentsComponent } from './entry/attachments/attachments.component';
import { EntryContentComponent } from './entry/entry-content/entry-content.component';
import { KnowledgeBaseComponent } from './entry/knowledge-base/knowledge-base.component';
import { KnowledgeBaseFiltersComponent } from './entry/knowledge-base/knowledge-base-filters/knowledge-base-filters.component';
import { KnowledgeBaseItemComponent } from './entry/knowledge-base/knowledge-base-item/knowledge-base-item.component';
import { KnowledgeBaseSearchComponent } from './entry/knowledge-base/knowledge-base-search/knowledge-base-search.component';
import { AttachmentItemComponent } from './entry/attachments/attachment-item/attachment-item.component';
import { CommentsComponent } from './entry/entry-content/comments/comments.component';
import { CommentItemComponent } from './entry/entry-content/comments/comment-item/comment-item.component';
import { EvaluationsComponent } from './entry/entry-content/evaluations/evaluations.component';
import { QuestionsComponent } from './entry/entry-content/questions/questions.component';
import { QuestionTextItemComponent } from './entry/entry-content/questions/question-text-item/question-text-item.component';
import { RisksCartographyComponent } from './entry/risks-cartography/risks-cartography.component';
import { ActionPlanComponent } from './entry/action-plan/action-plan.component';
import { DPOPeopleOpinionsComponent } from './entry/dpo-people-opinions/dpo-people-opinions.component';
import { ActionPlanGraphComponent } from './entry/action-plan/action-plan-graph/action-plan-graph.component';
import { ValidatePIAComponent } from './entry/validate-pia/validate-pia.component';
import { RefusePIAComponent } from './entry/refuse-pia/refuse-pia.component';
import { PiaValidateHistoryComponent } from './entry/validate-pia/pia-validate-history/pia-validate-history.component';

const appRoutes: Routes = [
  { path: '', component: AuthenticationComponent },
  { path: 'home', component: CardsComponent },
  { path: 'entry/:id/risks-cartography', component: RisksCartographyComponent },
  { path: 'entry/:id/action-plan', component: ActionPlanComponent },
  { path: 'entry/:id/dpo-and-people-opinions', component: DPOPeopleOpinionsComponent },
  { path: 'entry/:id/validate-PIA', component: ValidatePIAComponent },
  { path: 'entry/:id/refuse-PIA', component: RefusePIAComponent },
  { path: 'entry/:id', component: EntryComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AuthenticationComponent,
    CardsComponent,
    FiltersComponent,
    CardItemComponent,
    EntryComponent,
    SectionsComponent,
    AttachmentsComponent,
    EntryContentComponent,
    KnowledgeBaseComponent,
    KnowledgeBaseFiltersComponent,
    KnowledgeBaseItemComponent,
    KnowledgeBaseSearchComponent,
    AttachmentItemComponent,
    CommentsComponent,
    CommentItemComponent,
    EvaluationsComponent,
    QuestionsComponent,
    QuestionTextItemComponent,
    RisksCartographyComponent,
    ActionPlanComponent,
    DPOPeopleOpinionsComponent,
    ActionPlanGraphComponent,
    ValidatePIAComponent,
    RefusePIAComponent,
    PiaValidateHistoryComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
