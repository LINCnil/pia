import {
  Component,
  ViewChild,
  OnInit,
  Input,
  ElementRef,
  Output,
  EventEmitter
} from '@angular/core';
import {
  UntypedFormBuilder,
  FormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { Attachment } from 'src/app/models/attachment.model';

import { AttachmentsService } from 'src/app/services/attachments.service';

@Component({
  selector: 'app-attachment-item',
  templateUrl: './attachment-item.component.html',
  styleUrls: ['./attachment-item.component.scss']
})
export class AttachmentItemComponent implements OnInit {
  @ViewChild('pdfViewerAutoLoad', { static: false }) pdfViewerAutoLoad;
  @Input() editMode: 'local' | 'author' | 'evaluator' | 'validator' | 'guest' =
    'local';
  @Input() isPreview: boolean;
  @Input() attachment: Attachment;
  @Input() pia: any;
  @Output() deleted = new EventEmitter();
  fileUrl: any = null;

  showRemoveAttachmentForm = false;
  removeAttachmentForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private attachmentsService: AttachmentsService,
    private el: ElementRef
  ) {
    this.removeAttachmentForm = this.formBuilder.group({
      comment: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {}

  /**
   * Deletes an attachment with a given id.
   * @param id - Unique id of the attachment to be deleted.
   */
  removeAttachment(id: number): void {
    this.showRemoveAttachmentForm = true;
  }

  /**
   * Allows an user to download a specific attachment.
   */
  downloadAttachment(): void {
    this.attachmentsService.downloadAttachment(this.attachment.id);
  }

  /**
   * Allows an user to view a specific attachment.
   * @param show - Hide or show the preview block
   */
  previewAttachment(show: boolean): void {
    if (!this.isPreview) {
      const elPreview = this.el.nativeElement.querySelector(
        '.pia-attachmentsBlock-item-preview'
      );
      const embed = elPreview.querySelector('#iframe');
      const img = elPreview.querySelector('img');

      elPreview.classList.add('hide');
      img.classList.add('hide');

      if (show) {
        if (this.attachment.mime_type.endsWith('pdf')) {
          const data = this.attachment.file.split(';base64,')[1];
          const base64str = data;

          const binary = atob(base64str.replace(/\s/g, ''));
          const len = binary.length;
          const buffer = new ArrayBuffer(len);
          const view = new Uint8Array(buffer);
          for (let i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
          }

          const blob = new Blob([view], { type: 'application/pdf' });
          this.fileUrl = URL.createObjectURL(blob);

          elPreview.classList.remove('hide');
        } else if (this.attachment.mime_type.startsWith('image')) {
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
   * @return True if the PIA isn't validated (simple or signed validation), false otherwise.
   */
  showAddAttachmentButton(): boolean {
    return this.pia.status !== 2 && this.pia.status !== 3;
  }

  submitRemoveAttachment(): void {
    this.attachmentsService
      .removeAttachment(
        this.attachment.id,
        this.removeAttachmentForm.value.comment
      )
      .then(() => {
        this.deleted.emit(this.attachment.id);
        this.showRemoveAttachmentForm = false;
      })
      .catch(err => {
        console.log(err);
      });
  }
}
