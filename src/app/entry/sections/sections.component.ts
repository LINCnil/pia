import { Component, OnInit, Input, Output } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Pia } from '../pia.model';

import { PiaService } from 'app/entry/pia.service';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
  providers: [PiaService]
})
export class SectionsComponent implements OnInit {

  @Input() section: { id: number, title: string, display_mode: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  @Input() data: any;
  pia: Pia;

  constructor(private _piaService: PiaService) {
  }

  ngOnInit() {
    this.pia = this._piaService.getPIA();
  }
}
