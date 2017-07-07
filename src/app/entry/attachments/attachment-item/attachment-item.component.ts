import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-attachment-item',
  templateUrl: './attachment-item.component.html',
  styleUrls: ['./attachment-item.component.scss']
})
export class AttachmentItemComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  /**
   * Deletes an attachment which was added to a PIA.
   */    
  deleteAttachment() {
    alert('test');
  }

}
