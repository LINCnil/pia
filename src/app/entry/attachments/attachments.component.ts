import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  /**
   * Allows users to add attachments to a PIA.
   */
  addAttachment() {
    alert('test');
  }
}
