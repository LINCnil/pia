import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateTestingModule } from '@utils/testing/translate-testing.module';
import { SecurityModule } from '@security/security.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiModule } from '@api/api.module';
import { PiaService } from 'app/entry/pia.service';
import { AppDataService } from 'app/services/app-data.service';

import { ModalsService } from 'app/modals/modals.service';
import { PaginationService } from 'app/entry/entry-content/pagination.service';
import { SidStatusService } from 'app/services/sid-status.service';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';

import { LanguagesService } from 'app/services/languages.service';
import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import {AttachmentsService} from 'app/entry/attachments/attachments.service';
import { ActionPlanService } from 'app/entry/entry-content/action-plan/action-plan.service';
import { SafeHtmlPipe } from 'app/app.component';

@NgModule({
  declarations: [SafeHtmlPipe],
  providers:[
    PiaService,
    AppDataService,
    ModalsService,
    PaginationService,
    SidStatusService,
    GlobalEvaluationService,
    LanguagesService,
    KnowledgeBaseService,
    AttachmentsService,
    ActionPlanService

  ],
  imports: [
    FormsModule, ReactiveFormsModule,
    TranslateTestingModule,
    SecurityModule,
    RouterTestingModule,
    ApiModule
  ],
  exports: [FormsModule, ReactiveFormsModule, TranslateTestingModule, SecurityModule, RouterTestingModule, ApiModule, SafeHtmlPipe]
})

export class ComponentTestingModule { }
