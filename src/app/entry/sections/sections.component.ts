import { Component, OnInit, Input } from '@angular/core';
import 'rxjs/add/operator/map';

import { Evaluation } from 'src/app/entry/entry-content/evaluations/evaluation.model';
import { Measure } from 'src/app/entry/entry-content/measures/measure.model';
import { Answer } from 'src/app/entry/entry-content/questions/answer.model';

import { AppDataService } from 'src/app/services/app-data.service';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { PiaService } from 'src/app/services/pia.service';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';

import { IntrojsService } from '../../services/introjs.service';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
  providers: [PiaService]
})
export class SectionsComponent implements OnInit {
  @Input() section: {
    id: number;
    title: string;
    short_help: string;
    items: any;
  };
  @Input() item: {
    id: number;
    title: string;
    evaluation_mode: string;
    short_help: string;
    questions: any;
  };
  data: { sections: any };

  constructor(
    public _piaService: PiaService,
    private _appDataService: AppDataService,
    public _sidStatusService: SidStatusService,
    private _introjsService: IntrojsService
  ) {}

  async ngOnInit() {
    await this._piaService.getPIA();
    this.data = this._appDataService.dataNav;
    this.data.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        this._sidStatusService.setSidStatus(this._piaService.pia, section, item);
      });
    });
  }

  ngAfterViewChecked() {
    if (!this._introjsService.sectionsLoaded) {
      this._introjsService.sections(true);
    }
  }
}
