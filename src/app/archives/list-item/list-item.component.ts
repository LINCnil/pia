import { Component, Input, OnInit } from '@angular/core';

import { Attachment } from 'src/app/entry/attachments/attachment.model';

import { ModalsService } from 'src/app/modals/modals.service';

@Component({
  selector: `.app-list-item`,
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  providers: []
})
export class ListItemComponent implements OnInit {
  @Input() archivedPia: any;
  attachments: any;

  constructor(private _modalsService: ModalsService) { }

  ngOnInit() {
    const attachmentModel = new Attachment();
    this.attachments = [];
    attachmentModel.pia_id = this.archivedPia.id;
    attachmentModel.findAll().then((entries: any) => {
      entries.forEach(element => {
        if (element["file"] && element["file"].length) {
          this.attachments.push(element);
        }
      });
    });
  }

  /**
   * Unarchives an archived PIA with a given id.
   * @param {string} id - The archived PIA id.
   */
  unarchive(id: string) {
    /* TODO */
    localStorage.setItem('unarchive-id', id);
    this._modalsService.openModal('modal-unarchive-pia');
  }

  /**
   * Opens the modal to confirm deletion of an archived PIA
   * @param {string} id - The archived PIA id.
   */
  remove(id: string) {
    localStorage.setItem('archive-id', id);
    this._modalsService.openModal('modal-remove-archived-pia');
  }

}
