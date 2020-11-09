import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Attachment } from 'src/app/models/attachment.model';
import { Pia } from 'src/app/models/pia.model';
import { AttachmentsService } from 'src/app/services/attachments.service';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {
  @Input() isPreview: boolean;
  @Input() pia: Pia;
  attachments: Array<Attachment> = [];
  attachmentForm: FormGroup;
  dispplayAttachmentButton = false;
  loading: boolean = false;

  constructor(public _attachmentsService: AttachmentsService) {}

  ngOnInit() {
    this.attachmentForm = new FormGroup({
      attachment_file: new FormControl('', [])
    });
    this._attachmentsService.findAllByPia(this.pia.id)
      .then(((attachments: Array<Attachment>) => {
        this.attachments = attachments;
      }))
      .catch((err) => {
        console.log(err);
      });
    this.dispplayAttachmentButton = this.pia.status !== 2 && this.pia.status !== 3;
  }

  /**
   * Allows users to add attachments to a PIA.
   */
  addAttachment() {
    if (this.pia.is_example === 1) {
      return false;
    } else {
      const attachment = <HTMLInputElement>document.querySelector('[formcontrolname="attachment_file"]');
      attachment.click();
    }
  }

  onDeleted($event) {
    const index = this.attachments.findIndex(a => a.id === $event);
    if (index !== -1) {
      this.attachments.splice(index, 1);
    }
  }

  /**
   * Allows users to upload an attachment for a specific PIA.
   * @param {event} event - Any kind of event.
   */
  uploadAttachement(event: Event) {
    this.loading = true;
    this._attachmentsService
      .upload((<HTMLInputElement>event.target).files[0], this.pia.id)
      .then((attachment: Attachment) => {
        this.attachments.unshift(attachment);
        // if (attachment.pia_signed === 1) {
        //   // Add the last previous signed attachment in the signed attachments array
        //   this._attachmentsService.signedAttachments.unshift(this._attachmentsService.attachment_signed);
        //   // Allocate the new one
        //   this._attachmentsService.attachment_signed = attachment;
        // }
        this.loading = false;

      })
      .catch(() => {
        this.loading = true;
      });
  }
}
