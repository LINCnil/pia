import { Component, ViewChild, OnInit, Input, ElementRef } from '@angular/core';

import { ModalsService } from 'src/app/modals/modals.service';
import { AttachmentsService } from 'src/app/entry/attachments/attachments.service';

import {DomSanitizer} from "@angular/platform-browser";
@Component({
  selector: 'app-attachment-item',
  templateUrl: './attachment-item.component.html',
  styleUrls: ['./attachment-item.component.scss']
})
export class AttachmentItemComponent implements OnInit {
  @ViewChild('pdfViewerAutoLoad', { static: false }) pdfViewerAutoLoad;

  @Input() isPreview: boolean;
  @Input() attachment: any;
  @Input() pia: any;
  fileUrl:any = null;


  constructor(private domSanitizer : DomSanitizer,
              private _modalsService: ModalsService,
              private _attachmentsService: AttachmentsService,
              private el: ElementRef) { }

  ngOnInit() { }

  /**
   * Deletes an attachment with a given id.
   * @param {string} id - Unique id of the attachment to be deleted.
   */
  removeAttachment(id: string) {
    localStorage.setItem('attachment-id', id);
    this._modalsService.openModal('modal-remove-attachment');
  }

  /**
   * Allows an user to download a specific attachment.
   */
  downloadAttachment() {
    this._attachmentsService.downloadAttachment(this.attachment.id);
  }

  /**
   * Allows an user to view a specific attachment.
   * @param {boolean} show - Hide or show the preview block
   */
  previewAttachment(show: boolean) {
    if (!this.isPreview) {
      const elPreview = this.el.nativeElement.querySelector('.pia-attachmentsBlock-item-preview');
      const embed = elPreview.querySelector('#iframe');
      const img = elPreview.querySelector('img');

      elPreview.classList.add('hide');
      // embed.classList.add('hide');
      img.classList.add('hide');

      if (show) {
        if (this.attachment.mime_type.endsWith('pdf')) {
        // embed.setAttribute('src', this.attachment.file.replace('octet-stream', 'pdf'));
        // embed.classList.remove('hide');
          const data = this.attachment.file.split(';base64,')[1];
          // base64 string
          var base64str = data;

          // decode base64 string, remove space for IE compatibility
          var binary = atob(base64str.replace(/\s/g, ''));
          var len = binary.length;
          var buffer = new ArrayBuffer(len);
          var view = new Uint8Array(buffer);
          for (var i = 0; i < len; i++) {
              view[i] = binary.charCodeAt(i);
          }


          let blob = new Blob([view], {type: 'application/pdf'})
          this.fileUrl = URL.createObjectURL(blob);

          elPreview.classList.remove('hide');
          // this.downloadAttachment();
        } else if(this.attachment.mime_type.startsWith('image')) {
          img.setAttribute('src', this.attachment.file);
          img.classList.remove('hide');
          elPreview.classList.remove('hide');
        } else {
          this.downloadAttachment();
        }
      }
    }
  }

  /**
   * Checks if the add attachments button has to be shown, according to the PIA status.
   * @return {boolean} - True if the PIA isn't validated (simple or signed validation), false otherwise.
   */
  showAddAttachmentButton() {
    return (this.pia.status !== 2 && this.pia.status !== 3);
  }

}
