import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { ModalsComponent } from '../../modals/modals.component';
import { Measure } from './measures/measure.model';
import { Http } from '@angular/http';
import { Pia } from '../pia.model';
import 'rxjs/add/operator/map'

@Component({
  selector: 'app-entry-content',
  templateUrl: './entry-content.component.html',
  styleUrls: ['./entry-content.component.scss']
})
export class EntryContentComponent implements OnInit {

  @Input() measureName: string;
  @Input() measurePlaceholder: string;
  @Input() section: { id: number, title: string, display_mode: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  @Input() questions: any;
  @Input() pia: Pia;

  modal = new ModalsComponent(this.router);
  /* TODO : get additional measures from DB if there are some */
  measures: any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    const measuresModel = new Measure();
    /* TODO : find measures where PIA id = this.pia_id */
    measuresModel.findAll().then((entries) => {
      this.measures = entries;
      if (this.measures.length === 0) {
        this.addNewMeasure();
      }
      /* let i: number = 0;
      this.measures.forEach( key => {
        console.log(key);
        i = i + 1;
      });
      console.log(i); */

      if (this.measures && parseInt(this.measures.length) === 1) {
        /*
         * TODO : check if the only measure is empty :
         * measures[0].content == 'undefined' && measures[0].title == 'undefined'
         * Then open the modal...
        */
        console.log('TODO');
        /* this.modal.openModal('pia-declare-measures'); */
      }
    });
  }

  ngOnChanges() {
    if (this.measureName) {
      this.addNewMeasure(this.measureName, this.measurePlaceholder);
    }
  }

  /**
   * Allows an user to ask an evaluation for a section.
   */
  askForEvaluation() {
    this.modal.openModal('ask-for-evaluation');
    /* TODO : update PIA status + 'refresh PIA' so that it changes header status icon + navigation status icons */
  }

  /**
   * Allows an user to validate evaluation for a section.
   */
  validateEvaluation() {
    this.modal.openModal('validate-evaluation');
    /* TODO : update PIA status + 'refresh PIA' so that it changes header status icon + navigation status icons */
    /* It should also locks PIA updates for THIS section */
  }

  /**
   * Adds a new measure to the PIA (used in "RISKS" section, "Mesures existantes ou prévus" subsection).
   * @param {string} measureTitle the title of the measure to be added (used in some cases).
   */
  addNewMeasure(measureTitle?: string, measurePlaceholder?: string) {
    const newMeasureRecord = new Measure();
    newMeasureRecord.pia_id = this.pia.id;
    if (measureTitle) {
      newMeasureRecord.title = measureTitle;
    }
    if(measurePlaceholder) {
      newMeasureRecord.placeholder = measurePlaceholder;
    }
    newMeasureRecord.create().then((entry: number) => {
      newMeasureRecord.id = entry;
      this.measures.push(newMeasureRecord);
    });
  }

}
