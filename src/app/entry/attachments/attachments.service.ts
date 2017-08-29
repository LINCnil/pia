import { Injectable } from '@angular/core';

import { Attachment } from './attachment.model';

import { ModalsService } from 'app/modals/modals.service';

@Injectable()
export class AttachmentsService {

  attachments: any[];
  attachment_signed: any;
  pia: any;
  pia_signed = 0;

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

  async setSignedPia() {
    const attachment = new Attachment();
    attachment.pia_id = this.pia.id;
    return new Promise((resolve, reject) => {
      attachment.getSignedPia().then((entry: any) => {
        this.attachment_signed = entry;
        resolve();
      });
    });
  }

  upload(attachment_file: any) {
    const file = new Blob([attachment_file]);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const attachment = new Attachment();
      attachment.file = reader.result;
      attachment.name = attachment_file.name;
      attachment.mime_type = attachment_file.type;
      attachment.pia_id = this.pia.id;
      attachment.pia_signed = this.pia_signed;
      attachment.create().then((id: number) => {
        attachment.id = id;
        this.attachments.unshift(attachment);
        if (attachment.pia_signed === 1) {
          this.attachment_signed = attachment;
        }
      });
    }
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
    const attachmentId = parseInt(localStorage.getItem('attachment-id'), 10);

    // Removes from DB.
    const attachment = new Attachment();
    attachment.delete(attachmentId);

    // Deletes from the attachments array.
    const index = this.attachments.findIndex(p => p.id === attachmentId);
    if (index !== -1) {
      this.attachments.splice(index, 1);
    }
    if (this.attachment_signed && this.attachment_signed.id === attachmentId) {
      this.attachment_signed = null;
    }

    localStorage.removeItem('attachment-id');
    this._modalsService.closeModal();
  }

}
