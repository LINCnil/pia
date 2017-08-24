import { Component, OnInit, Input, Output, OnChanges } from '@angular/core';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { PiaService } from 'app/entry/pia.service';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
  providers: [PiaService]
})
export class SectionsComponent implements OnInit, OnChanges {

  @Input() section: { id: number, title: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  @Input() data: any;
  showValidationButton = false;
  showRefuseButton = false;
  homepageDisplayMode = localStorage.getItem('homepageDisplayMode');

  constructor(private _piaService: PiaService, private _evaluationService: EvaluationService) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this._piaService.getPIA().then(() => {
      this._piaService.piaInGlobalValidation().then((valid: boolean) => {
        this.showValidationButton = (valid && this._piaService.pia.status !== 1);
        this.showRefuseButton = (valid && this._piaService.pia.status === 1);
      });
    });
  }
}
