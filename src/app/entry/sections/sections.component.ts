import { Component, OnInit, Input, Output } from '@angular/core';
import { Evaluation } from '../entry-content/evaluations/evaluation.model';
import { AppDataService } from '../../services/app-data.service';
import { SidStatusService } from '../../services/sid-status.service';
import { Measure } from '../entry-content/measures/measure.model';
import { Answer } from '../entry-content/questions/answer.model';
import 'rxjs/add/operator/map';

import { PiaService } from '../pia.service';
import { GlobalEvaluationService } from '../../services/global-evaluation.service';
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
