import { Component, OnInit, Input, Output } from '@angular/core';
import { Http } from '@angular/http';
import { Pia } from '../pia.model';
import 'rxjs/add/operator/map'

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss']
})
export class SectionsComponent implements OnInit {

  @Input() section: { id: number, title: string, display_mode: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  @Input() pia: Pia;
  @Input() data: any;

  constructor() {
  }

  ngOnInit() {
  }
}
