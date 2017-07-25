import { Component, Input, OnInit } from '@angular/core';
import { ModalsComponent } from '../../modals/modals.component';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {Measure} from './measures/measure.model';

@Component({
  selector: 'app-entry-content',
  templateUrl: './entry-content.component.html',
  styleUrls: ['./entry-content.component.scss']
})
export class EntryContentComponent implements OnInit {

  pia_id: number;
  @Input() measureName: string;
  @Input() section: string;
  modal = new ModalsComponent(this.router);
  /* TODO : get additional measures from DB if there are some */
  measures: any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router = router;
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.pia_id = params['id'];
    });

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
      this.addNewMeasure(this.measureName);
    }
  }

  /**
   * Returns the current PIA section.
   * @returns {string} the name of section.
   */
  getCurrentSection() {
    return this.section;
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
   */
  addNewMeasure(measureTitle?: string) {
    /*
     * TODO : faire en sorte que l'id se mette bien et qu'il ne faille pas rafraîchir pour qu'il apparaîsse.
     * Sinon on se retrouve avec des mesures avec un id vide... et après c'est bon au rafraîchissement.
    */
    const newMeasureRecord = new Measure();
    newMeasureRecord.pia_id = this.pia_id;
    if (measureTitle) {
      newMeasureRecord.title = measureTitle;
    }
    newMeasureRecord.create();
    this.measures.push(newMeasureRecord);
  }

}
