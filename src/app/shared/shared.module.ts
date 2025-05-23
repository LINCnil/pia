import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './components/header/header.component';
import {
  SafeHtmlPipe,
  Nl2brPipe,
  FormatTheDate,
  FilterForUser
} from '../tools';
import { IntrojsService } from '../services/introjs.service';
import { LanguagesService } from '../services/languages.service';
import { KnowledgesService } from '../services/knowledges.service';
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import { GlobalEvaluationService } from '../services/global-evaluation.service';
import { PaginationService } from '../services/pagination.service';
import { SidStatusService } from '../services/sid-status.service';
import { AppDataService } from '../services/app-data.service';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ModalComponent } from './components/modal/modal.component';
import { DialogService } from '../services/dialog.service';
import { DialogComponent } from './components/dialog/dialog.component';
import { AnswerService } from '../services/answer.service';
import { KnowledgeBaseItemComponent } from './components/knowledge-base/knowledge-base-item/knowledge-base-item.component';
import { KnowledgeBaseComponent } from './components/knowledge-base/knowledge-base.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { TranslatePipe } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    FormatTheDate,
    SafeHtmlPipe,
    Nl2brPipe,
    FormatTheDate,
    FilterForUser,
    HeaderComponent,
    ModalComponent,
    DialogComponent,
    KnowledgeBaseComponent,
    KnowledgeBaseItemComponent,
    LoadingOverlayComponent
  ],
  exports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    SafeHtmlPipe,
    Nl2brPipe,
    FormsModule,
    FormatTheDate,
    TagInputModule,
    FilterForUser,
    HeaderComponent,
    ModalComponent,
    DialogComponent,
    KnowledgeBaseComponent,
    KnowledgeBaseItemComponent,
    LoadingOverlayComponent,
    PdfJsViewerModule
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PdfJsViewerModule,
    TranslatePipe,
    FaIconComponent
  ],
  providers: [
    AppDataService,
    KnowledgeBaseService,
    KnowledgesService,
    PaginationService,
    SidStatusService,
    LanguagesService,
    AnswerService,
    GlobalEvaluationService,
    FormatTheDate,
    IntrojsService,
    DialogService,
    PdfJsViewerModule,
    AuthService,
    ApiService,
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule
    };
  }
}
