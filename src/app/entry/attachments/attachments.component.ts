import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Attachment } from './attachment.model';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {

  pia_id: number;
  attachmentForm: FormGroup;
  attachments: any;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.pia_id = params['id'];
    });
    this.attachmentForm = new FormGroup({
      attachment_file: new FormControl('', [])
    });
    const attachment = new Attachment();
    // TODO findByPiaID !
    attachment.findAll().then((data) => {
      this.attachments = data;
    });
  }

  /**
   * Allows users to add attachments to a PIA.
   */
  addAttachment() {
    const attachment: any = document.querySelector('[formcontrolname="attachment_file"]');
    attachment.click();
  }

  uploadAttachement(event: any) {
    const attachment_file = event.target.files[0];
    const file = new Blob([attachment_file]);
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const attachment = new Attachment();
      attachment.file = reader.result;
      console.log(attachment_file);
      attachment.name = attachment_file.name;
      attachment.mime_type = attachment_file.type;
      attachment.pia_id = this.pia_id;
      console.log(this.pia_id);
      console.log(attachment);
      attachment.create().then((entry) => {
        this.attachments.unshift(attachment);
      });
    }
  }
}
