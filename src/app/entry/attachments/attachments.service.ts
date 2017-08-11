import { Injectable } from '@angular/core';

import { Attachment } from './attachment.model';

import { ModalsService } from 'app/modals/modals.service';

@Injectable()
export class AttachmentsService {

  attachments: any[];
  pia: any;

  constructor(private _modalsService: ModalsService) {
  }

  async listAttachments() {
    return new Promise((resolve, reject) => {
      const attachment = new Attachment();
      attachment.pia_id = this.pia.id;
      attachment.findAll().then((data: any[]) => {
        this.attachments = data;
        resolve();
      });
    });
  }

  downloadAttachment(id: number) {
    const attachment = new Attachment();
    attachment.find(id).then((entry: any) => {
      const url = entry.file.replace('data:', 'data:' + entry.mime_type);
      fetch(url).then(res => res.blob()).then(blob => {
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = entry.name;
        a.click();
      });
    });
  }

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
