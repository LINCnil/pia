import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Pia } from '../pia.model';

import { AttachmentsService } from 'src/app/entry/attachments/attachments.service';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {
  @Input() isPreview: boolean;
  @Input() pia: Pia;
  attachmentForm: FormGroup;
  dispplayAttachmentButton = false;

  constructor(public _attachmentsService: AttachmentsService) { }

  ngOnInit() {
    this.attachmentForm = new FormGroup({
      attachment_file: new FormControl('', [])
    });
    this._attachmentsService.pia = this.pia;
    this._attachmentsService.listAttachments();
    this.dispplayAttachmentButton = (this.pia.status !== 2 && this.pia.status !== 3);
  }

  /**
   * Allows users to add attachments to a PIA.
   */
  addAttachment() {
    if (this.pia.is_example === 1) {
      return false;
    } else {
      this._attachmentsService.pia_signed = 0;
       const attachment = <HTMLInputElement> document.querySelector('[formcontrolname="attachment_file"]');
      attachment.click();
    }
  }

  /**
   * Allows users to upload an attachment for a specific PIA.
   * @param {event} event - Any kind of event.
   */
  uploadAttachement(event: Event) {
    this._attachmentsService.upload((<HTMLInputElement> event.target).files[0]);
  }
}
