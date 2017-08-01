import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Http } from '@angular/http';
import { Pia } from '../pia.model';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { PiaService } from 'app/entry/pia.service';

@Component({
  selector: 'app-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.scss'],
  providers: [PiaService]
})
export class KnowledgeBaseComponent implements OnInit, OnChanges {
  searchForm: FormGroup;
  pia: Pia;
  @Input() item: any;
  @Output() newMeasureEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private http: Http,
              private _measureService: MeasureService,
              private _knowledgeBaseService: KnowledgeBaseService,
              private _piaService: PiaService) {
    this._knowledgeBaseService.loadData(this.http);
  }

  ngOnInit() {
    this.pia = this._piaService.getPIA();
    this.searchForm = new FormGroup({
      q: new FormControl()
    });
  }

  ngOnChanges() {
    this._knowledgeBaseService.loadByItem(this.item);
  }

  onSubmit() {
    this._knowledgeBaseService.q = this.searchForm.value.q;
    this._knowledgeBaseService.search();
  }

  /**
   * Allows an user to add a new measure (with its title and its placeholder) through the knowledge base.
   * @param {Event} event any kind of event.
   */
  addNewMeasure(event) {
    this._measureService.addNewMeasure(this.pia, event.name, event.placeholder);
  }

}
