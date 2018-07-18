import { Injectable } from '@angular/core';
// import * as b64ToBlob from 'b64toBlob';

import { ModalsService } from '../../modals/modals.service';

import { AttachmentModel } from '@api/models';
import { AttachmentApi } from '@api/services';


@Injectable()
export class AttachmentsService {

  attachments: any[];
  signedAttachments: any[] = [];
  attachment_signed: any;
  pia: any;
  pia_signed = 0;

  constructor(
    private _modalsService: ModalsService,
    private attachmentApi: AttachmentApi
  ) { }

  /**
   * List all attachments.
   * @returns {Promise}
   * @memberof AttachmentsService
   */
  async listAttachments() {
    return new Promise((resolve, reject) => {
      this.attachmentApi.getAll(this.pia.id).subscribe((entries: AttachmentModel[]) => {
        this.attachments = entries;
        resolve();
      });
    });
  }

  /**
   * Update all signed attachement.
   * @returns {Promise}
   * @memberof AttachmentsService
   */
  async updateSignedAttachmentsList() {
    return new Promise((resolve, reject) => {
      this.signedAttachments = [];

      this.attachmentApi.getAll(this.pia.id).subscribe((entries: AttachmentModel[]) => {
        // Store all signed attachments if they are not yet stored
        entries.forEach(a => {
          if (a.pia_signed && a.pia_signed === 1) {
            this.signedAttachments.push(a);
          }
        });
        // If we have some signed attachments :
        if (this.signedAttachments && this.signedAttachments.length > 0) {
          this.signedAttachments.reverse(); // Reverse array (latest signed attachment at first)
          if (this.signedAttachments[0] && this.signedAttachments[0].file && this.signedAttachments[0].file.length > 0) {
            // Store the latest signed attachment only if file isn't empty
            this.attachment_signed = this.signedAttachments[0];
            // Remove it from the signed attachments array so that we get the oldest
            this.signedAttachments.splice(0, 1);
          }
        }
        resolve();
      });
    });
  }

  /**
   * Upload a new attachment.
   * @param {*} attachment_file - The attachment file.
   * @memberof AttachmentsService
   */
  upload(attachment_file: any) {
    const file = new Blob([attachment_file]);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const attachment = new AttachmentModel();
      attachment.file = reader.result;
      attachment.name = attachment_file.name;
      attachment.mime_type = attachment_file.type;
      attachment.pia_id = this.pia.id;
      attachment.pia_signed = this.pia_signed;
      attachment.comment = '';

      this.attachmentApi.create(attachment).subscribe((newAttachment: AttachmentModel) => {
        attachment.fromJson(newAttachment);
        this.attachments.unshift(attachment);
        if (attachment.pia_signed === 1) {
          // Add the last previous signed attachment in the signed attachments array
          this.signedAttachments.unshift(this.attachment_signed);
          // Allocate the new one
          this.attachment_signed = attachment;
        }
        // To refresh signed attachments on validation page
        this.updateSignedAttachmentsList();
      });

    }
  }

  /**
   * Download an attachment by id.
   * @param {number} id - Id of the attachment.
   * @memberof AttachmentsService
   */
  downloadAttachment(id: number) {
    this.attachmentApi.get(this.pia.id, id).subscribe((entry: any) => {
      const blob = this.b64ToBlob(entry.file, entry.mime_type);
      const a = <any>document.createElement('a');
      const event = new MouseEvent('click', {
        view: window
      });

      a.href = URL.createObjectURL(blob);
      a.download = entry.name;
      a.dispatchEvent(event);
    });
  }

  /**
   * Allows an user to remove a PIA.
   * @param {string} comment - Comment to justify deletion.
   * @memberof AttachmentsService
   */
  removeAttachment(comment: string) {
    if (comment && comment.length > 0) {
      const attachmentId = parseInt(localStorage.getItem('attachment-id'), 10);

      // Remove from DB by erasing only the "file" field
      this.attachmentApi.deleteById(this.pia.id, attachmentId).subscribe();

      // Deletes from the attachments array.
      const index = this.attachments.findIndex(p => p.id === attachmentId);
      if (index !== -1) {
        this.attachments.splice(index, 1);
      }
      if (this.attachment_signed && this.attachment_signed.id === attachmentId) {
        this.attachment_signed.comment = comment;
        this.attachment_signed.file = null;
        this.signedAttachments.unshift(this.attachment_signed);
        this.attachment_signed = null;
      }

      localStorage.removeItem('attachment-id');
      this._modalsService.closeModal();
    }
  }

  b64ToBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
  };

}
