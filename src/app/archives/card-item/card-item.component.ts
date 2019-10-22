import { Component, OnInit, Input } from '@angular/core';

import { Attachment } from 'src/app/entry/attachments/attachment.model';

import { ModalsService } from 'src/app/modals/modals.service';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss', './card-item_edit.component.scss', './card-item_doing.component.scss'],
  providers: []
})
export class CardItemComponent implements OnInit {
  @Input() archivedPia: any;
  @Input() previousArchivedPia: any;
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
   * Deletes an archived PIA with a given id.
   * @param {string} id - The archived PIA id.
   */
  remove(id: string) {
    localStorage.setItem('archive-id', id);
    this._modalsService.openModal('modal-remove-archived-pia');
  }

}
