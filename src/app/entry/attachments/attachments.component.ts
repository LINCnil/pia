import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Pia } from '../pia.model';
import { Attachment } from './attachment.model';

import { AttachmentsService } from 'app/entry/attachments/attachments.service';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {

  @Input() pia: Pia;
  attachmentForm: FormGroup;

  constructor(private activatedRoute: ActivatedRoute,
              private _attachmentsService: AttachmentsService) { }

  ngOnInit() {
    this.attachmentForm = new FormGroup({
      attachment_file: new FormControl('', [])
    });
    const attachment = new Attachment();
    attachment.pia_id = this.pia.id;
    attachment.findAll().then((data: any[]) => {
      this._attachmentsService.attachments = data;
    });
  }

  /**
   * Allows users to add attachments to a PIA.
   */
  addAttachment() {
    const attachment: any = document.querySelector('[formcontrolname="attachment_file"]');
    attachment.click();
  }

  /**
   * Allows users to upload an attachment for a specific PIA.
   * @param {event} event : any kind of event.
   */
  uploadAttachement(event: any) {
    const attachment_file = event.target.files[0];
    const file = new Blob([attachment_file]);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const attachment = new Attachment();
      attachment.file = reader.result;
      attachment.name = attachment_file.name;
      attachment.mime_type = attachment_file.type;
      attachment.pia_id = this.pia.id;
      attachment.create().then((id: number) => {
        attachment.id = id;
        this._attachmentsService.attachments.unshift(attachment);
      });
    }
  }

  /**
   * Checks if the form has to be shown, according to the PIA status.
   * @return true if the PIA isn't validated (simple or signed validation), false otherwise.
   */
  showAttachmentForm() {
    return (this.pia.status !== 2 && this.pia.status !== 3);
  }
}
