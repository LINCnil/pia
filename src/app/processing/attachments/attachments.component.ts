import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ProcessingModel, ProcessingAttachmentModel } from '@api/models';
import { ProcessingApi, ProcessingAttachmentApi } from '@api/services';
import { AttachmentsService } from './attachments.service';

@Component({
  selector: 'app-processing-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {

  @Input() processing: ProcessingModel;
  attachmentForm: FormGroup;

  constructor(public attachmentsService: AttachmentsService) { }

  ngOnInit() {
    this.attachmentsService.processing = this.processing;
    this.attachmentsService.listAttachments();

    this.attachmentForm = new FormGroup({
      attachment_file: new FormControl('', [])
    });
  }

  /**
   * Allows users to add attachments to a Processing.
   * @memberof AttachmentsComponent
   */
  addAttachment() {
    const attachment = <HTMLInputElement>document.querySelector('[formcontrolname="attachment_file"]');

    attachment.click();
  }
}
