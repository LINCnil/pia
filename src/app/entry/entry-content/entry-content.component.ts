import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-entry-content',
  templateUrl: './entry-content.component.html',
  styleUrls: ['./entry-content.component.scss']
})
export class EntryContentComponent implements OnInit {

  @Input() section: string;

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

}
