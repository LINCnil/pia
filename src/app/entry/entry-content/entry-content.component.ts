import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import 'rxjs/add/operator/map';

import { Answer } from 'src/app/entry/entry-content/questions/answer.model';

import { AppDataService } from 'src/app/services/app-data.service';
import { MeasureService } from 'src/app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'src/app/modals/modals.service';
import { PiaService } from 'src/app/services/pia.service';
import { PaginationService } from 'src/app/entry/entry-content/pagination.service';
import { TranslateService } from '@ngx-translate/core';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { KnowledgeBaseService } from 'src/app/entry/knowledge-base/knowledge-base.service';

@Component({
  selector: 'app-entry-content',
  templateUrl: './entry-content.component.html',
  styleUrls: ['./entry-content.component.scss'],
  providers: [PiaService]
})
export class EntryContentComponent implements OnInit, OnChanges {
  @Input() section: any;
  @Input() item: any;
  @Input() questions: any;
  @Input() data: any;

  userAnswersForImpacts = [];
  userAnswersForThreats = [];
  userAnswersForSources = [];

  constructor(
    private _router: Router,
    private _appDataService: AppDataService,
    private _activatedRoute: ActivatedRoute,
    public _measureService: MeasureService,
    private _modalsService: ModalsService,
    public _piaService: PiaService,
    public _sidStatusService: SidStatusService,
    public _globalEvaluationService: GlobalEvaluationService,
    public _paginationService: PaginationService,
    private _translateService: TranslateService,
    private _knowledgeBaseService: KnowledgeBaseService
  ) {}

  ngOnInit() {
    // Reset measures no longer addable from KB when switching PIA
    this._knowledgeBaseService.toHide = [];

    // Update the last edited date for this PIA
    this._piaService.getPIA().then(() => {
      this._piaService.pia.updated_at = new Date();
      this._piaService.pia.update();

      if (this._piaService.pia.is_archive === 1) {
        this._router.navigate(['home']);
      }
    });
  }

  async ngOnChanges() {
    await this._piaService.getPIA();
    this._paginationService.dataNav = this._appDataService.dataNav;

    const sectionId = parseInt(this._activatedRoute.snapshot.params.section_id, 10);
    const itemId = parseInt(this._activatedRoute.snapshot.params.item_id, 10);

    if (sectionId && itemId) {
      this._paginationService.setPagination(sectionId, itemId);
    }
  }

  /**
   * Prepare entry for evaluation.
   */
  prepareForEvaluation() {
    this._globalEvaluationService.prepareForEvaluation().then(() => {
      let isPiaFullyEdited = true;
      for (const el in this._sidStatusService.itemStatus) {
        if (this._sidStatusService.itemStatus.hasOwnProperty(el) && this._sidStatusService.itemStatus[el] < 4 && el !== '4.3') {
          isPiaFullyEdited = false;
        }
      }
      if (isPiaFullyEdited) {
        this.goToNextSectionItem(4, 5);
        this._modalsService.openModal('completed-edition');
      } else {
        this.goToNextSectionItem(0, 4);
        this._modalsService.openModal('ask-for-evaluation');
      }
    });
  }

  /**
   * Allow an user to validate evaluation for a section.
   */
  validateEvaluation() {
    this._globalEvaluationService.validateAllEvaluation().then((toFix: boolean) => {
      this.goToNextSectionItem(5, 7);
      let isPiaFullyEvaluated = true;
      for (const el in this._sidStatusService.itemStatus) {
        if (this._sidStatusService.itemStatus.hasOwnProperty(el) && this._sidStatusService.itemStatus[el] !== 7 && el !== '4.3') {
          isPiaFullyEvaluated = false;
        }
      }
      if (isPiaFullyEvaluated) {
        this._modalsService.openModal('completed-evaluation');
      } else if (toFix) {
        this._modalsService.openModal('validate-evaluation-to-correct');
      } else {
        this._modalsService.openModal('validate-evaluation');
      }
    });
  }

  /**
   * Go to next item.
   * @private
   * @param {number} status_start - From status.
   * @param {number} status_end - To status.
   */
  private goToNextSectionItem(status_start: number, status_end: number) {
    const goto_section_item = this._paginationService.getNextSectionItem(status_start, status_end);

    this._router.navigate(['entry', this._piaService.pia.id, 'section', goto_section_item[0], 'item', goto_section_item[1]]);
  }

  /**
   * Allow an user to return in edit mode.
   */
  cancelAskForEvaluation() {
    this._globalEvaluationService.cancelForEvaluation();
    this._modalsService.openModal('back-to-edition');
  }

  /**
   * Allow an user to cancel the validation.
   */
  cancelValidateEvaluation() {
    this._globalEvaluationService.cancelValidation();
    this._modalsService.openModal('back-to-evaluation');
  }
}
