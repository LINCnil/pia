import { Component, OnInit, Input, Output } from '@angular/core';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { AppDataService } from 'app/services/app-data.service';
import { SidStatusService } from 'app/services/sid-status.service';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import 'rxjs/add/operator/map';

import { PiaService } from 'app/entry/pia.service';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';
import { PiaType } from '@api/model/pia.model';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
  providers: []
})
export class SectionsComponent implements OnInit {

  @Input() section: { id: number, permissions: string[], title: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  data: { sections: any };

  constructor(public _piaService: PiaService,
              private _appDataService: AppDataService,
              public _sidStatusService: SidStatusService,
              private _globalEvaluationService: GlobalEvaluationService) {
  }

  async ngOnInit() {
    this.data = await this._appDataService.getDataNav(this._piaService.pia);

    this.data.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        this._sidStatusService.setSidStatus(this._piaService, section, item);
      });
    });
  }
}
