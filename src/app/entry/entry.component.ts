import { Component, OnInit, Input } from '@angular/core';
import { EntryContentComponent } from './entry-content/entry-content.component';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss']
})
export class EntryComponent implements OnInit {

  measureTitle: string;

  constructor() { }

  ngOnInit() { }

  addNewMeasure(event) {
    this.measureTitle = event;
  }

}
