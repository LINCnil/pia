import { Component, Input, OnInit } from '@angular/core';
import { ModalsComponent } from '../../modals/modals.component';

@Component({
  selector: 'app-entry-content',
  templateUrl: './entry-content.component.html',
  styleUrls: ['./entry-content.component.scss']
})
export class EntryContentComponent implements OnInit {

  @Input() section: string;
  modal = new ModalsComponent();

  constructor() { }

  ngOnInit() {
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

}
