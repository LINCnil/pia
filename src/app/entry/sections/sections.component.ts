import { Component, OnInit, Input, Output } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';

import { AppDataService } from 'app/services/app-data.service';
import { SidStatusService } from 'app/services/sid-status.service';
import { PiaService } from 'app/services/pia.service';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
  providers: [PiaService]
})
export class SectionsComponent implements OnInit {

  @Input() section: { id: number, title: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  data: { sections: any };

  constructor(public _piaService: PiaService,
              private _appDataService: AppDataService,
              public _sidStatusService: SidStatusService,
              private _globalEvaluationService: GlobalEvaluationService) {
  }

  async ngOnInit() {
    await this._piaService.getPIA();
    this.data = await this._appDataService.getDataNav();
    this.data.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        this._sidStatusService.setSidStatus(this._piaService, section, item);
      });
    });
  }
}
