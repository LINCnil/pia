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

@Component({
  selector: 'app-entry-content',
  templateUrl: './entry-content.component.html',
  styleUrls: ['./entry-content.component.scss'],
  providers: [PiaService]
})

export class EntryContentComponent implements OnInit, OnChanges {
  @Input() section: { id: number, title: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  @Input() questions: any;
  @Input() data: any;

  constructor(private _router: Router,
              private _appDataService: AppDataService,
              private _activatedRoute: ActivatedRoute,
              private _measureService: MeasureService,
              private _modalsService: ModalsService,
              private _piaService: PiaService,
              private _evaluationService: EvaluationService,
              private _paginationService: PaginationService,
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

    this._evaluationService.setPia(this._piaService.pia);
    this._evaluationService.allowEvaluation();
    this._paginationService.setPagination(parseInt(this._activatedRoute.snapshot.params['section_id'], 10),
                                          parseInt(this._activatedRoute.snapshot.params['item_id'], 10));
  }

  /**
   * Allows an user to validate evaluation for a section.
   */
  validateEvaluation() {
    this._evaluationService.validateAllEvaluation().then((valid: boolean) => {
      this._router.navigate([
        'entry',
        this._piaService.pia.id,
        'section',
        this._paginationService.nextLink[0],
        'item',
        this._paginationService.nextLink[1]
      ]);
      if (valid) {
        this._modalsService.openModal('validate-evaluation');
      } else {
        this._modalsService.openModal('validate-evaluation-to-correct');
      }
    });
  }

}
