import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Modules
import { SharedModule } from './shared.module';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

// Components
import { AuthenticationComponent } from './authentication/authentication.component';
import { CardsComponent } from './cards/cards.component';
import { CardItemComponent } from './cards/card-item/card-item.component';
import { EntryComponent } from './entry/entry.component';
import { SectionsComponent } from './entry/sections/sections.component';
import { AttachmentsComponent } from './entry/attachments/attachments.component';
import { EntryContentComponent } from './entry/entry-content/entry-content.component';
import { AttachmentItemComponent } from './entry/attachments/attachment-item/attachment-item.component';
import { CommentsComponent } from './entry/entry-content/comments/comments.component';
import { CommentItemComponent } from './entry/entry-content/comments/comment-item/comment-item.component';
import { EvaluationsComponent } from './entry/entry-content/evaluations/evaluations.component';
import { RisksCartographyComponent } from './entry/entry-content/risks-cartography/risks-cartography.component';
import { ActionPlanComponent } from './entry/entry-content/action-plan/action-plan.component';
import { DPOPeopleOpinionsComponent } from './entry/entry-content/dpo-people-opinions/dpo-people-opinions.component';
import { ValidatePIAComponent } from './entry/entry-content/validate-pia/validate-pia.component';
import { RefusePIAComponent } from './entry/entry-content/refuse-pia/refuse-pia.component';
import { PiaValidateHistoryComponent } from './entry/entry-content/validate-pia/pia-validate-history/pia-validate-history.component';
import { SettingsComponent } from './settings/settings.component';
import { HelpComponent } from './help/help.component';
import { OverviewRisksComponent } from './entry/entry-content/overview-risks/overview-risks.component';
import { ErrorsComponent } from './errors/errors.component';
import {
    ActionPlanImplementationComponent
  } from './entry/entry-content/action-plan/action-plan-implementation/action-plan-implementation.component';
import { ListItemComponent } from './cards/list-item/list-item.component';
import { AboutComponent } from './about/about.component';

import { StructuresModule } from './structures/structures.module';
import { ArchivesModule } from './archives/archives.module';

import { MeasuresComponent } from './entry/entry-content/measures/measures.component';
import { QuestionsComponent } from './entry/entry-content/questions/questions.component';
import { Angular2CsvModule } from 'angular2-csv';
import { PreviewComponent } from './preview/preview.component';
import { ExportComponent } from './shared/export/export.component';
import { RevisionsComponent } from './shared/revisions/revisions.component';

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
    AttachmentItemComponent,
    CommentsComponent,
    CommentItemComponent,
    EvaluationsComponent,
    RisksCartographyComponent,
    ActionPlanComponent,
    DPOPeopleOpinionsComponent,
    ValidatePIAComponent,
    RefusePIAComponent,
    PiaValidateHistoryComponent,
    SettingsComponent,
    HelpComponent,
    OverviewRisksComponent,
    ErrorsComponent,
    ActionPlanImplementationComponent,
    ListItemComponent,
    AboutComponent,
    MeasuresComponent,
    QuestionsComponent,
    PreviewComponent,
    ExportComponent,
    RevisionsComponent,
  ],
  imports: [
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    StructuresModule,
    ArchivesModule,
    Angular2CsvModule,
    PdfJsViewerModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
