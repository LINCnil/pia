import { Component, OnInit, Input } from '@angular/core';

import { Attachment } from '../attachment.model';

import { ModalsService } from 'app/modals/modals.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';

@Component({
  selector: 'app-attachment-item',
  templateUrl: './attachment-item.component.html',
  styleUrls: ['./attachment-item.component.scss']
})
export class AttachmentItemComponent implements OnInit {

  @Input() attachment: any;
  @Input() pia: any;

  constructor(private _modalsService: ModalsService, private _attachmentsService: AttachmentsService) { }

  ngOnInit() {
  }

  /**
   * Deletes an attachment with a given id.
   * @param {string} id unique id of the attachment to be deleted.
   */
  removeAttachment(id: string) {
    localStorage.setItem('attachment-id', id);
    this._modalsService.openModal('modal-remove-attachment');
  }

  /**
   * Allows an user to download a specific attachment.
   * @param {number} id the unique id of the attachment.
   */
  downloadAttachment(id: number) {
    this._attachmentsService.downloadAttachment(id);
  }

  /**
   * Checks if the add attachments button has to be shown, according to the PIA status.
   * @return true if the PIA isn't validated (simple or signed validation), false otherwise.
   */
  showAddAttachmentButton() {
    return (this.pia.status !== 2 && this.pia.status !== 3);
  }

}
