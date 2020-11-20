import { Injectable } from '@angular/core';
import { ApplicationDb } from '../application.db';
import { Attachment } from '../models/attachment.model';

@Injectable()
export class AttachmentsService extends ApplicationDb {
  signedAttachments: any[] = [];
  attachment_signed: any;

  constructor() {
    super(201708291502, 'attachment');
  }

  /**
   * List all attachments.
   */
  async findAllByPia(pia_id) {
    const items = [];
    if (pia_id) {
      await this.getObjectStore();
      return new Promise((resolve, reject) => {
        if (this.serverUrl) {
          fetch(this.getServerUrl(),{
            mode: 'cors'
          }).then((response) => {
            return response.json();
          }).then((result: any) => {
            resolve(result);
          }).catch ((error) => {
            console.error('Request failed', error);
            reject();
          });
        } else {
          const index1 = this.objectStore.index('index1');
          const evt = index1.openCursor(IDBKeyRange.only(pia_id));
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          }
          evt.onsuccess = (event: any) => {
            const cursor = event.target.result;
            if (cursor) {
              items.push(cursor.value);
              cursor.continue();
            } else {
              resolve(items);
            }
          }
        }
      });
    }
  }

  async create(attachment): Promise<Attachment> {
    this.created_at = new Date();
    const data = {
      ...attachment
    };
    await this.getObjectStore();
    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        const formData = new FormData();
        for (const d in data) {
          if (data.hasOwnProperty(d)) {
            formData.append('attachment[' + d + ']', data[d]);
          }
        }
        fetch(this.getServerUrl(), {
          method: 'POST',
          body: formData,
          mode: 'cors'
        }).then((response) => {
          return response.json();
        }).then((result: any) => {
          resolve(result);
        }).catch ((error) => {
          console.error('Request failed', error);
          reject();
        });
      } else {
        const evt = this.objectStore.add(data);
        evt.onsuccess = (event: any) => {
          resolve(event.target.result);
        };
        evt.onerror = (event: any) => {
          console.error(event);
          reject(Error(event));
        };
      }
    });
  }

  async remove(comment: string, attachmentId): Promise<void> {
    return new Promise((resolve, reject) => {
      this.find(attachmentId).then((entry: any) => {
        entry.file = null;
        entry.comment = comment;
        entry.updated_at = new Date();
        if (this.serverUrl) {
          const formData = new FormData();
          for (const d in entry) {
            if (entry.hasOwnProperty(d)) {
              formData.append('attachment[' + d + ']', entry[d]);
            }
          }
          fetch(this.getServerUrl() + '/' + entry.id, {
            method: 'PATCH',
            body: formData,
            mode: 'cors'
          }).then((response) => {
            return response.json();
          }).then((result: any) => {
            resolve();
          }).catch ((error) => {
            console.error('Request failed', error);
            reject();
          });
        } else {
          this.getObjectStore().then(() => {
            const evt = this.objectStore.put(entry);
            evt.onerror = (event: any) => {
              console.error(event);
              reject(Error(event));
            }
            evt.onsuccess = () => {
              resolve();
            };
          });
        }
      });
    });
  }

  async findAll(): Promise<any> {
    const items = [];
    if (this.pia_id) {
      await this.getObjectStore();
      return new Promise((resolve, reject) => {
        if (this.serverUrl) {
          fetch(this.getServerUrl(),{
            mode: 'cors'
          }).then(function(response) {
            return response.json();
          }).then(function(result: any) {
            resolve(result);
          }).catch (function (error) {
            console.error('Request failed', error);
            reject();
          });
        } else {
          const index1 = this.objectStore.index('index1');
          const evt = index1.openCursor(IDBKeyRange.only(this.pia_id));
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          }
          evt.onsuccess = (event: any) => {
            const cursor = event.target.result;
            if (cursor) {
              items.push(cursor.value);
              cursor.continue();
            } else {
              resolve(items);
            }
          }
        }
      });
    }
  }

  /**
   * Update all signed attachement.
   */
  async updateSignedAttachmentsList(piaId): Promise<void>  {
    return new Promise((resolve, reject) => {
      this.signedAttachments = [];
      this.findAllByPia(piaId).then((data: any[]) => {
        // Store all signed attachments if they are not yet stored
        data.forEach(a => {
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
   */
  upload(attachment_file: any, piaId, piaSigned = 0): Promise<Attachment>  {
    return new Promise((resolve, reject) => {
      const file = new Blob([attachment_file]);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const attachment = new Attachment();
        attachment.file = reader.result;
        attachment.name = attachment_file.name
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\.[^/.]+$/, '')
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
        attachment.mime_type = attachment_file.type;
        attachment.pia_id = piaId;
        attachment.pia_signed = piaSigned;
        attachment.comment = '';
        this.create(attachment)
          .then((res: Attachment) => {
            // To refresh signed attachments on validation page
            this.updateSignedAttachmentsList(piaId).then(() => {
              // ---
              resolve(attachment);
            });
          })
          .catch(() => {
            reject(true);
          });
      };
    });
  }

  /**
   * Download an attachment by id.
   * @param {number} id - Id of the attachment.
   */
  downloadAttachment(id: number): void {
    this.find(id).then((entry: any) => {
      fetch(entry.file, {
        mode: 'cors'
      })
        .then(res => res.blob())
        .then(blob => {
          const a = <any>document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          a.download = entry.name;
          const event = new MouseEvent('click', {
            view: window
          });
          a.dispatchEvent(event);
        });
    });
  }

  /**
   * Allows an user to remove a PIA.
   * @param {string} comment - Comment to justify deletion.
   */
  removeAttachment(attachmentId: number, comment: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (comment && comment.length > 0) {
        // Remove from DB by erasing only the "file" field
        this.remove(comment, attachmentId)
          .then(() => {
            if (this.attachment_signed && this.attachment_signed.id === attachmentId) {
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
      }
    });

  }
}
