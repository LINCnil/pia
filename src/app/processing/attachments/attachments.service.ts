import { Injectable } from '@angular/core';
import { ModalsService } from '../../modals/modals.service';
import { ProcessingAttachmentModel } from '@api/models';
import { ProcessingAttachmentApi } from '@api/services';


@Injectable()
export class AttachmentsService {
  processing: any;

  constructor(
    private _modalsService: ModalsService,
    private attachmentApi: ProcessingAttachmentApi
  ) { }

  /**
   * List all attachments.
   * @returns {Promise}
   * @memberof AttachmentsService
   */
  async listAttachments() {
    return new Promise((resolve, reject) => {
      this.attachmentApi.getAll(this.processing.id).subscribe((entries: ProcessingAttachmentModel[]) => {
        this.processing.attachments = entries;
        resolve();
      });
    });
  }

  /**
   * Allows users to upload an attachment for a specific Processing.
   * @param {event} event - Any kind of event.
   * @memberof AttachmentsComponent
   */
  uploadAttachement(event: Event) {
    const attachment_file = (<HTMLInputElement>event.target).files[0];
    const file = new Blob([attachment_file]);
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const attachment = new ProcessingAttachmentModel();

      attachment.file = reader.result;
      attachment.name = attachment_file.name;
      attachment.mime_type = attachment_file.type;
      attachment.processing_id = this.processing.id;
      attachment.comment = '';

      this.attachmentApi.create(attachment).subscribe((newAttachment: ProcessingAttachmentModel) => {
        attachment.fromJson(newAttachment);
        this.processing.attachments.unshift(attachment);
      });

    }
  }

  /**
   * Allows a user to download a specific attachment.
   * @param {number} id - The unique id of the attachment.
   * @memberof AttachmentsService
   */
  downloadAttachment(id: number) {
    this.attachmentApi.get(this.processing.id, id).subscribe((entry: any) => {
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
   * Allows an user to delete an Attachment.
   * @param {string} comment - Comment to justify deletion.
   * @memberof AttachmentsService
   */
  deleteAttachment() {
    const attachmentId = parseInt(localStorage.getItem('attachment-id'), 10);

    // Remove from DB by erasing only the "file" field
    this.attachmentApi.deleteById(this.processing.id, attachmentId).subscribe();

    // Deletes from the attachments array.
    const index = this.processing.attachments.findIndex(p => p.id === attachmentId);

    if (index !== -1) {console.log('splice');
      this.processing.attachments.splice(index, 1);
    }

    localStorage.removeItem('attachment-id');
    this._modalsService.closeModal();
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
