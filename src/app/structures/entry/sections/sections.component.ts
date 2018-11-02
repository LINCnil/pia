import { Component, OnInit, Input, Output } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { AppDataService } from 'app/services/app-data.service';
import { SidStatusService } from 'app/services/sid-status.service';
import { StructureService } from 'app/services/structure.service';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
  providers: [StructureService]
})
export class SectionsComponent implements OnInit {

  @Input() section: { id: number, title: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  data: { sections: any };

  constructor(public _structureService: StructureService,
              public _sidStatusService: SidStatusService,
              private _appDataService: AppDataService) {
  }

  async ngOnInit() {
    await this._structureService.getStructure();
    this.data = this._structureService.structure.data;
  }
}
