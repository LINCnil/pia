import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'

import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

import { AppDataService } from 'app/services/app-data.service';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';
import { PaginationService } from './pagination.service';
import { TranslateService } from '@ngx-translate/core';
import { SidStatusService } from 'app/services/sid-status.service';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';
import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';

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

  constructor(private _router: Router,
              private _appDataService: AppDataService,
              private _activatedRoute: ActivatedRoute,
              public _measureService: MeasureService,
              private _modalsService: ModalsService,
              public _piaService: PiaService,
              public _sidStatusService: SidStatusService,
              public _globalEvaluationService: GlobalEvaluationService,
              public _paginationService: PaginationService,
              private _translateService: TranslateService,
              private _knowledgeBaseService: KnowledgeBaseService) { }

  ngOnInit() {
    // Reset measures no longer addable from KB when switching PIA
    this._knowledgeBaseService.toHide = [];

    // Update the last edited date for this PIA
    this._piaService.getPIA().then(() => {
      this._piaService.pia.updated_at = new Date();
      this._piaService.pia.update();
    });
  }

  async ngOnChanges() {
    this._paginationService.dataNav = await this._appDataService.getDataNav();
    await this._piaService.getPIA();

    const sectionId = parseInt(this._activatedRoute.snapshot.params['section_id'], 10);
    const itemId = parseInt(this._activatedRoute.snapshot.params['item_id'], 10);

    this._paginationService.setPagination(sectionId, itemId);

    // Redirect users accessing validation page if requirements not met
    /* TODO make it works for refusal PIA status + */
    // if (sectionId === 4 && itemId === 4) {
    //   if ((!this._globalEvaluationService.enablePiaValidation && !this._globalEvaluationService.piaIsRefused)
    //   || (this._globalEvaluationService.piaIsRefused && !this._piaService.pia.applied_adjustements)) {
    //     this._router.navigate(['entry', this._piaService.pia.id, 'section', 1, 'item', 1])
    //   }
    // }

    // // Redirect users accessing refusal page if requirements not met
    // if (sectionId === 4 && itemId === 5) {
    //   if (!this._globalEvaluationService.enablePiaValidation && !this._globalEvaluationService.piaIsRefused) {
    //     this._router.navigate(['entry', this._piaService.pia.id, 'section', 1, 'item', 1])
    //   }
    // }
  }

  /**
   * Prepare entry for evaluation.
   * @memberof EntryContentComponent
   */
  prepareForEvaluation() {
    this._globalEvaluationService.prepareForEvaluation().then(() => {
      this.goToNextSectionItem(0, 4);
      let isPiaFullyEdited = true;
      for (const el in this._sidStatusService.itemStatus) {
        if (this._sidStatusService.itemStatus.hasOwnProperty(el) && this._sidStatusService.itemStatus[el] < 4 && el !== '4.3') {
          isPiaFullyEdited = false;
        }
      }
      if (isPiaFullyEdited) {
        this._modalsService.openModal('completed-edition');
      } else {
        this._modalsService.openModal('ask-for-evaluation');
      }
    });
  }

  /**
   * Allow an user to validate evaluation for a section.
   * @memberof EntryContentComponent
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
   * Get next item to go.
   * @private
   * @param {number} status_start - From status.
   * @param {number} status_end - To status.
   * @memberof EntryContentComponent
   */
  private goToNextSectionItem(status_start: number, status_end: number) {
    let goto_section = null;
    let goto_item = null;

    const itemStatus = Object.keys(this._sidStatusService.itemStatus).sort().reduce(
      (r, k) => (r[k] = this._sidStatusService.itemStatus[k], r), {}
    );

    for (const el in itemStatus) {
      if (this._sidStatusService.itemStatus.hasOwnProperty(el) &&
          this._sidStatusService.itemStatus[el] >= status_start &&
          this._sidStatusService.itemStatus[el] < status_end &&
          el !== '4.3') {
        const reference_to = el.split('.');
        goto_section = reference_to[0];
        goto_item = reference_to[1];
        break;
      }
    }

    if (!goto_section || !goto_item) {
      goto_section = this._paginationService.nextLink[0];
      goto_item = this._paginationService.nextLink[1];
    }

    this._router.navigate([
      'entry',
      this._piaService.pia.id,
      'section',
      goto_section,
      'item',
      goto_item
    ]);
  }

  /**
   * Allow an user to return in edit mode.
   * @memberof EntryContentComponent
   */
  cancelAskForEvaluation() {
    this._globalEvaluationService.cancelForEvaluation();
  }

  /**
   * Allow an user to cancel the validation.
   * @memberof EntryContentComponent
   */
  cancelValidateEvaluation() {
    this._globalEvaluationService.cancelValidation();
  }

}
