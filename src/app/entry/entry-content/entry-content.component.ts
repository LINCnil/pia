import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, Input, OnChanges, AfterViewChecked } from '@angular/core';
import { Measure } from './measures/measure.model';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'

import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';

import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';

@Component({
  selector: 'app-entry-content',
  templateUrl: './entry-content.component.html',
  styleUrls: ['./entry-content.component.scss'],
  providers: [PiaService]
})
export class EntryContentComponent implements OnInit, OnChanges, AfterViewChecked {

  @Input() measureName: string;
  @Input() measurePlaceholder: string;
  @Input() section: { id: number, title: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  @Input() questions: any;
  @Input() data: any;
  answers: Answer[] = [];

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private _measureService: MeasureService,
              private _modalsService: ModalsService,
              private _piaService: PiaService,
              private _evaluationService: EvaluationService) {
  }

  ngOnInit() {
    const measuresModel = new Measure();
    // const answersModel = new Answer();
    this._piaService.getPIA().then((entry) => {
      this._piaService.pia.updated_at = new Date();
      this._piaService.pia.update();
      measuresModel.pia_id = this._piaService.pia.id;
      measuresModel.findAll().then((entries: any[]) => {
        this._measureService.measures = entries;
        // if (this._measureService.measures.length === 0) {
        //   this._measureService.addNewMeasure(this._piaService.pia);
        // }
      });
    });
  }

  ngOnChanges() {
    this._evaluationService.setPia(this._piaService.pia);
    this._evaluationService.allowEvaluation();
    if (this.measureName) {
      this._measureService.addNewMeasure(this._piaService.pia, this.measureName, this.measurePlaceholder);
    }
  }

  ngAfterViewChecked() {
    // TODO This doesn't work some time.
    if (this._measureService.measures &&
        this._measureService.measures[0] &&
        this._measureService.measures[0].content &&
        this._measureService.measures[0].content.length <= 0 &&
        this._measureService.measures[0].title.length <= 0 && this.section.id === 3 && this.item.id !== 1) {
      this._modalsService.openModal('pia-declare-measures');
    }
  }

  /**
   * Allows an user to validate evaluation for a section.
   */
  validateEvaluation() {
    this._evaluationService.validateAllEvaluation();
    this._modalsService.openModal('validate-evaluation');
  }

}
