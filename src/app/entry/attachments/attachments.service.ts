import { Injectable } from '@angular/core';

import { Attachment } from './attachment.model';

import { ModalsService } from 'app/modals/modals.service';

@Injectable()
export class AttachmentsService {

  private _modalsService = new ModalsService();
  attachments: any[];

  /**
   * Allows an user to remove a PIA.
   */
  removeAttachment() {
    const AttachmentID = parseInt(localStorage.getItem('attachment-id'), 10);

    // Removes from DB.
    const attachment = new Attachment();
    attachment.delete(AttachmentID);

    // Deletes from the attachments array.
    const index = this.attachments.findIndex(p => p.id === AttachmentID);
    if (index !== -1) {
      this.attachments.splice(index, 1);
    }

    localStorage.removeItem('attachment-id');
    this._modalsService.closeModal();
  }

}
