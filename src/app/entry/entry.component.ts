import { Component, OnInit } from '@angular/core';
import { ModalsComponent } from '../modals/modals.component';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss']
})
export class EntryComponent implements OnInit {

  /* Do not remove.
   * Allows this component to get access to ModalsComponent methods used by entry children components here.
   */
  modal = new ModalsComponent();

  constructor() { }

  ngOnInit() {
  }

}
