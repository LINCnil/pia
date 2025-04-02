import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDb } from '../application.db';
import { Attachment } from '../models/attachment.model';
import { ApiService } from './api.service';

@Injectable()
export class AttachmentsService extends ApplicationDb {
  signedAttachments: any[] = [];
  attachment_signed: any;
  pia_signed;

  constructor(private router: Router, protected apiService: ApiService) {
    super(201708291502, 'attachment');
    super.prepareApi(this.apiService);
    super.prepareServerUrl(this.router);
  }

  /**
   * List all attachments.
   */
  async findAllByPia(pia_id: number): Promise<Attachment[]> {
    if (pia_id) {
      await this.getObjectStore();
      return new Promise((resolve, reject) => {
        super
          .findAll(null, { index: 'index1', value: pia_id })
          .then((result: any) => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  }

  async add(attachment): Promise<Attachment> {
    this.created_at = new Date();
    const data = {
      ...attachment
    };
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      super
        .create(data, 'attachment')
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          console.error('Request failed', error);
          reject();
        });
    });
  }

  async remove(comment: string, attachmentId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.find(attachmentId).then((entry: any) => {
        entry.file = null;
        entry.comment = comment;
        entry.updated_at = new Date();
        super
          .update(entry.id, entry, 'attachment')
          .then((result: any) => {
            resolve(result);
          })
          .catch(error => {
            console.error('Request failed', error);
            reject(error);
          });
      });
    });
  }

  /**
   * Update all signed attachment.
   */
  async updateSignedAttachmentsList(piaId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.findAllByPia(piaId)
        .then((data: any[]) => {
          resolve(this.processSignedAttachments(data));
        })
        .catch(err => reject(err));
    });
  }

  /**
   * Upload a new attachment.
   * @param attachment_file - The attachment file.
   * @param piaId - Id of the PIA
   */
  async upload(attachment_file: any, piaId: number): Promise<Attachment> {
    const attachment = await this.handleFileFromInput(attachment_file);
    attachment.pia_id = piaId;
    attachment.pia_signed = this.pia_signed ? this.pia_signed : 0;
    attachment.comment = '';

    return new Promise((resolve, reject) => {
      super
        .create(attachment, 'attachment')
        .then((res: any) => {
          // To refresh signed attachments on validation page
          this.updateSignedAttachmentsList(piaId).then(() => {
            this.signedAttachments.push(res);
            resolve(res);
          });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  private handleFileFromInput(attachment_file: any): Promise<Attachment> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const attachment = new Attachment();
        attachment.name = this.formatFileName(attachment_file.name);
        attachment.mime_type = attachment_file.type;
        attachment.file = attachment_file;
        resolve(attachment);
      };
      reader.onerror = (event) => {
        reject(event.target.error);
      };
      reader.readAsArrayBuffer(attachment_file);
    });
  }

  private formatFileName(fileName: string): string {
    const ext = fileName.split('.')[fileName.split('.').length - 1];

    const formattedName = fileName
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\.[^/.]+$/, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');

    return formattedName + (ext ? '.' + ext : '');
  }

  /**
   * Download an attachment by id.
   * @param id - Id of the attachment.
   */
  downloadAttachment(id: number): void {
    super.find(id).then((entry: any) => {
      // If entry.file is a URL (string starting with http or /)
      if (typeof entry.file === 'string' && entry.file.startsWith('http')) {
        this.downloadFile(entry.file, entry.name);
      } else {
        // Fallback for base64 data (for backward compatibility)
        fetch(entry.file, {
          mode: 'cors'
        })
          .then(res => res.blob())
          .then(blob => {
            this.downloadFile(window.URL.createObjectURL(blob), entry.name);
          });
      }
    });
  }

  private downloadFile(url: string, filename: string) {
    const a = document.createElement('a') as HTMLElement;
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.setAttribute('download', filename);
    a.click();
  }

  /**
   * Allows an user to remove a PIA.
   * @param attachmentId - Id of the attachment to remove.
   * @param comment - Comment to justify deletion.
   */
  removeAttachment(attachmentId: number, comment: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (comment && comment.length > 0) {
        // Remove from DB by erasing only the "file" field
        this.remove(comment, attachmentId)
          .then(() => {
            if (
              this.attachment_signed &&
              this.attachment_signed.id === attachmentId
            ) {
              this.attachment_signed.comment = comment;
              this.attachment_signed.file = null;
              this.signedAttachments.unshift(this.attachment_signed);
              this.attachment_signed = null;
            }
            resolve();
          })
          .catch(err => {
            reject(err);
          });
      } else {
        reject();
      }
    });
  }

  /**
   * Process signed attachments from data.
   * @param data - The attachment data to process.
   * @returns The processed signed attachments.
   */
  private processSignedAttachments(data: any[]): any[] {
    this.signedAttachments = [];
    // Store all signed attachments if they are not yet stored
    data.forEach(a => {
      if (Boolean(a.pia_signed) || a.pia_signed === 1) {
        this.signedAttachments.push(a);
      }
    });

    // If we have some signed attachments :
    if (this.signedAttachments && this.signedAttachments.length > 0) {
      this.signedAttachments.reverse(); // Reverse array (latest signed attachment at first)
      if (
        this.signedAttachments[0] &&
        this.signedAttachments[0].file &&
        this.signedAttachments[0].file.length > 0
      ) {
        // Store the latest signed attachment only if file isn't empty
        this.attachment_signed = this.signedAttachments[0];
        // Remove it from the signed attachments array so that we get the oldest
        this.signedAttachments.splice(0, 1);
      }
    } else {
      this.signedAttachments = data;
    }
    return this.signedAttachments;
  }
}
