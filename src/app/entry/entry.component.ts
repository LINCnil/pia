import { Component, OnInit } from '@angular/core';

declare var modalObject: any

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss']
})
export class EntryComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  closeModal() {
    modalObject.modalDisplayer();
  }

}
