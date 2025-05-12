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
import { faDownload } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-attachment-item',
  templateUrl: './attachment-item.component.html',
  styleUrls: ['./attachment-item.component.scss'],
  standalone: false
})
export class AttachmentItemComponent implements OnInit {
  @ViewChild('pdfViewerAutoLoad', { static: false }) pdfViewerAutoLoad;
  @Input() editMode: 'local' | 'author' | 'evaluator' | 'validator' | 'guest' =
    'local';
  @Input() isPreview: boolean;
  @Input() attachment: Attachment;
  @Input() pia: any;
  @Output() deleted = new EventEmitter();
  pdfSrc: string = null;
  imgSrc: string = null;

  showRemoveAttachmentForm = false;
  removeAttachmentForm: UntypedFormGroup;

  protected readonly faDownload = faDownload;

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
      elPreview.classList.add('hide');
      if (show) {
        if (
          !this.attachment.mime_type.endsWith('pdf') &&
          !this.attachment.mime_type.startsWith('image')
        ) {
          return this.downloadAttachment();
        }

        const isFileUrl =
          typeof this.attachment.file === 'string' &&
          (this.attachment.file.startsWith('http') ||
            this.attachment.file.startsWith('/'));

        let localUrl: string;
        if (!isFileUrl) {
          const blob = new Blob([this.attachment.file], {
            type: this.attachment.mime_type
          });
          localUrl = URL.createObjectURL(blob);
        }

        if (this.attachment.mime_type.endsWith('pdf')) {
          this.pdfSrc = isFileUrl
            ? encodeURIComponent(this.attachment.file)
            : localUrl;
        } else if (this.attachment.mime_type.startsWith('image')) {
          this.imgSrc = isFileUrl ? this.attachment.file : localUrl;
        }

        elPreview.classList.remove('hide');
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
