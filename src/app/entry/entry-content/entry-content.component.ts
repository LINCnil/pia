import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, Input, OnChanges, AfterViewInit } from '@angular/core';
import { Measure } from './measures/measure.model';
import { Http } from '@angular/http';
import { Pia } from '../pia.model';
import 'rxjs/add/operator/map'

import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'app/modals/modals.service';

@Component({
  selector: 'app-entry-content',
  templateUrl: './entry-content.component.html',
  styleUrls: ['./entry-content.component.scss']
})
export class EntryContentComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() measureName: string;
  @Input() measurePlaceholder: string;
  @Input() section: { id: number, title: string, display_mode: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  @Input() questions: any;
  @Input() pia: Pia;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private _measureService: MeasureService,
              private _modalsService: ModalsService) {
  }

  ngOnInit() {
    const measuresModel = new Measure();
    /* TODO : find measures where PIA id = this.pia_id */
    measuresModel.findAll().then((entries: any[]) => {
      this._measureService.measures = entries;
      if (this._measureService.measures.length === 0) {
        this._measureService.addNewMeasure(this.pia);
      }
    });
  }

  ngAfterViewInit() {
    /*
    * TODO : check if the only measure is empty (length problem...)
    */
    if (this._measureService.measures && this._measureService.measures.length === 1) {
      this._modalsService.openModal('pia-declare-measures');
    }
  }

  ngOnChanges() {
    if (this.measureName) {
      this._measureService.addNewMeasure(this.pia, this.measureName, this.measurePlaceholder);
    }
  }

  /**
   * Allows an user to ask an evaluation for a section.
   */
  askForEvaluation() {
    this._modalsService.openModal('ask-for-evaluation');
    /* TODO : update PIA status + 'refresh PIA' so that it changes header status icon + navigation status icons */
  }

  /**
   * Allows an user to validate evaluation for a section.
   */
  validateEvaluation() {
    this._modalsService.openModal('validate-evaluation');
    /* TODO : update PIA status + 'refresh PIA' so that it changes header status icon + navigation status icons */
    /* It should also locks PIA updates for THIS section */
  }

}
