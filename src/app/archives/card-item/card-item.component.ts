import { Component, OnInit, Input } from '@angular/core';

import { Pia } from 'src/app/entry/pia.model';
import { Attachment } from 'src/app/entry/attachments/attachment.model';

import { ModalsService } from 'src/app/modals/modals.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: [
    './card-item.component.scss',
    './card-item_edit.component.scss',
    './card-item_doing.component.scss'
  ],
  providers: []
})
export class CardItemComponent implements OnInit {
  @Input() archivedPia: any;
  @Input() previousArchivedPia: any;
  attachments: any;

  constructor(
    private _modalsService: ModalsService,
    private _translateService: TranslateService
  ) {}

  ngOnInit() {
    const attachmentModel = new Attachment();
    this.attachments = [];
    attachmentModel.pia_id = this.archivedPia.id;
    attachmentModel.findAll().then((entries: any) => {
      entries.forEach(element => {
        if (element['file'] && element['file'].length) {
          this.attachments.push(element);
        }
      });
    });
  }

  /**
   * Unarchive an archived PIA with a given id.
   * @param {string} id - The archived PIA id.
   */
  unarchive(id: string) {
    localStorage.setItem('pia-to-unarchive-id', id);
    this._modalsService.openModal('modal-unarchive-pia');
  }

  /**
   * Delete an archived PIA with a given id.
   * @param {string} id - The archived PIA id.
   */
  remove(id: string) {
    localStorage.setItem('pia-to-remove-id', id);
    this._modalsService.openModal('modal-remove-archived-pia');
  }
}
