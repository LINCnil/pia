import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Attachment } from 'app/entry/attachments/attachment.model';

import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/services/pia.service';

@Component({
  selector: `.app-list-item`,
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent implements OnInit {
  @Input() pia: any;
  attachments: any;

  constructor(private router: Router,
              private route: ActivatedRoute,
              public _piaService: PiaService,
              private _modalsService: ModalsService) { }

  ngOnInit() {
    const attachmentModel = new Attachment();
    attachmentModel.pia_id = this.pia.id;
    attachmentModel.findAll().then((entries: any) => {
      this.attachments = entries;
    });
  }

  /**
   * Focuses out field and update PIA.
   * @param {string} attribute - Attribute of the PIA.
   * @param {*} event - Any Event.
   * @memberof ListItemComponent
   */
  onFocusOut(attribute: string, event: any) {
    const text = event.target.innerText;
    this.pia[attribute] = text;
    this.pia.update();
  }

  /**
   * Opens the modal to confirm deletion of a PIA
   * @param {string} id - The PIA id.
   * @memberof ListItemComponent
   */
  removePia(id: string) {
    localStorage.setItem('pia-id', id);
    this._modalsService.openModal('modal-remove-pia');
  }

  /**
   * Export the PIA
   * @param {number} id - The PIA id.
   * @memberof ListItemComponent
   */
  export(id: number) {
    this._piaService.export(id);
  }
}
