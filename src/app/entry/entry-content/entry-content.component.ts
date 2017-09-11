import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'

import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';
import { PaginationService } from './pagination.service';

@Component({
  selector: 'app-entry-content',
  templateUrl: './entry-content.component.html',
  styleUrls: ['./entry-content.component.scss'],
  providers: [PiaService]
})

export class EntryContentComponent implements OnInit, OnChanges {
  @Input() measureName: string;
  @Input() measurePlaceholder: string;
  @Input() section: { id: number, title: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  @Input() questions: any;
  @Input() data: any;

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _measureService: MeasureService,
              private _modalsService: ModalsService,
              private _piaService: PiaService,
              private _evaluationService: EvaluationService,
              private _paginationService: PaginationService) {
  }

  ngOnInit() {
    this._piaService.getPIA().then((entry) => {
      this._piaService.pia.updated_at = new Date();
      this._piaService.pia.update();
    });
  }

  ngOnChanges() {
    this._piaService.getPIA().then((entry) => {
      this._evaluationService.setPia(this._piaService.pia);
      this._evaluationService.allowEvaluation();
      if (this.measureName) {
        this._measureService.addNewMeasure(this._piaService.pia, this.measureName, this.measurePlaceholder);
      }
      this._paginationService.sectionId = parseInt(this._activatedRoute.snapshot.params['section_id'], 10);
      this._paginationService.itemId = parseInt(this._activatedRoute.snapshot.params['item_id'], 10);
      this._paginationService.checkForPreviousLink(this.data);
      this._paginationService.checkForNextLink(this.data);
    });
  }

  /**
   * Allows an user to validate evaluation for a section.
   */
  validateEvaluation() {
    this._evaluationService.validateAllEvaluation().then((valid: boolean) => {
      this._router.navigate(['entry',this._piaService.pia.id, 'section', this._paginationService.nextLink[0], 'item', this._paginationService.nextLink[1]]);
      if (valid) {
        this._modalsService.openModal('validate-evaluation');
      } else {
        this._modalsService.openModal('validate-evaluation-to-correct');
      }
    });
  }

}
