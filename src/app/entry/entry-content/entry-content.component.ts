import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'

import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

import { AppDataService } from 'app/services/app-data.service';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';
import { PaginationService } from './pagination.service';
import { TranslateService } from '@ngx-translate/core';
import { SidStatusService } from 'app/services/sid-status.service';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';

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
              protected _measureService: MeasureService,
              private _modalsService: ModalsService,
              protected _piaService: PiaService,
              protected _sidStatusService: SidStatusService,
              protected _globalEvaluationService: GlobalEvaluationService,
              private _evaluationService: EvaluationService,
              protected _paginationService: PaginationService,
              private _translateService: TranslateService) {
  }

  ngOnInit() {
    this._piaService.getPIA().then(() => {
      this._piaService.pia.updated_at = new Date();
      this._piaService.pia.update();
    });
  }

  async ngOnChanges() {
    this._paginationService.dataNav = await this._appDataService.getDataNav();
    await this._piaService.getPIA();

    // this._evaluationService.setPia(this._piaService.pia);
    // this._evaluationService.allowEvaluation();

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
   * Prepare entry for evaluation
   * @memberof EntryContentComponent
   */
  prepareForEvaluation() {
    this._globalEvaluationService.prepareForEvaluation().then(() => {
      this._router.navigate([
        'entry', this._piaService.pia.id, 'section',
        this._paginationService.nextLink[0], 'item',
        this._paginationService.nextLink[1]
      ]);
      this._modalsService.openModal('ask-for-evaluation');
    });
    // this._evaluationService.prepareForEvaluation(this._piaService, this._sidStatusService, this.section, this.item);
  }

  /**
   * Allow an user to validate evaluation for a section.
   * @memberof EntryContentComponent
   */
  validateEvaluation() {
    this._globalEvaluationService.validateAllEvaluation().then((toFix: boolean) => {
      this._router.navigate([
        'entry',
        this._piaService.pia.id,
        'section',
        this._paginationService.nextLink[0],
        'item',
        this._paginationService.nextLink[1]
      ]);
      if (toFix) {
        this._modalsService.openModal('validate-evaluation-to-correct');
      } else {
        this._modalsService.openModal('validate-evaluation');
      }
    });
  }

  /**
   * Allow an user to return in edit mode
   * @memberof EntryContentComponent
   */
  cancelAskForEvaluation() {
    this._globalEvaluationService.cancelForEvaluation();
    // this._evaluationService.cancelForEvaluation(this._piaService, this._sidStatusService, this.section, this.item);
  }

  /**
   * Allow an user to cancel the validation
   * @memberof EntryContentComponent
   */
  cancelValidateEvaluation() {
    this._globalEvaluationService.cancelValidation();
    // this._evaluationService.cancelValidation().then((valid: boolean) => {
    //   this._sidStatusService.setSidStatus(this._piaService, this.section, this.item);
    // });
  }

}
