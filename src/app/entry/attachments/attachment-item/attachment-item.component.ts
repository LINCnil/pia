import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { Attachment } from '../attachment.model';

@Component({
  selector: 'app-attachment-item',
  templateUrl: './attachment-item.component.html',
  styleUrls: ['./attachment-item.component.scss']
})
export class AttachmentItemComponent implements OnInit {

  pia_id: number;
  @Input() attachment: any;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.pia_id = params['id'];
    });
  }

  /**
   * Deletes an attachment which was added to a PIA.
   */
  deleteAttachment(id: number, event: Event) {
    // TODO Change to use MODAL
    if (confirm('Merci de confirmer la suppression de cette pièce jointe')) {
      const attachment = new Attachment();
      attachment.delete(id);
      event.srcElement.parentElement.parentElement.remove();
    }
  }

  downloadAttachment(id) {
    const attachment = new Attachment();
    attachment.find(id).then((entry: any) => {
      const url = entry.file.replace('data:', 'data:' + entry.type);
      fetch(url).then(res => res.blob()).then(blob => {
          const url = window.URL.createObjectURL(blob);
          window.open(url);
        }
      );
    });
  }

}
