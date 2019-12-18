import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as FileSaver from 'file-saver';

import { Pia } from 'src/app/entry/pia.model';
import { Attachment } from 'src/app/entry/attachments/attachment.model';

import { ModalsService } from 'src/app/modals/modals.service';
import { PiaService } from 'src/app/services/pia.service';
import { TranslateService } from '@ngx-translate/core';

declare const require: any;

@Component({
  selector: `.app-list-item`,
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent implements OnInit {
  @Input() pia: any;
  @Output() piaEvent = new EventEmitter<Pia>();
  attachments: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public _piaService: PiaService,
    private _modalsService: ModalsService,
    private _translateService: TranslateService
  ) {}

  ngOnInit() {
    const attachmentModel = new Attachment();
    this.attachments = [];
    attachmentModel.pia_id = this.pia.id;
    attachmentModel.findAll().then((entries: any) => {
      entries.forEach(element => {
        if (element['file'] && element['file'].length) {
          this.attachments.push(element);
        }
      });
    });
  }

  /**
   * Generate a ZIP with the attachments and the .json
   */
  async generateZip() {
    setTimeout(() => {
      const JSZip = require('jszip');
      const zip = new JSZip();
      /* Attachments */
      this.addAttachmentsToZip(zip).then((zip2: any) => {
        /* JSON */
        this._piaService.export(this.pia.id).then((data: any) => {
          zip2.file('pia.json', data, { binary: true });
          /* Save as .zip */
          zip2.generateAsync({ type: 'blob' }).then(blobContent => {
            FileSaver.saveAs(blobContent, 'pia-' + this.pia.name + '.zip');
          });
        });
      });
    }, 500);
  }

  /**
   * Add all active attachments (not the removed ones) to the zip after converting them as blob files
   * @param zip
   */
  async addAttachmentsToZip(zip) {
    return new Promise(async (resolve, reject) => {
      this.attachments.forEach(attachment => {
        const byteCharacters1 = atob((attachment.file as any).split(',')[1]);
        const folderName = this._translateService.instant(
          'summary.attachments'
        );
        zip.file(folderName + '/' + attachment.name, byteCharacters1, {
          binary: true
        });
      });
      resolve(zip);
    });
  }

  /**
   * Focus out field and update PIA.
   * @param {string} attribute - Attribute of the PIA.
   * @param {*} event - Any Event.
   */
  onFocusOut(attribute: string, event: any) {
    const text = event.target.innerText;
    this.pia[attribute] = text;
    this.pia.update();
    this.piaEvent.emit(this.pia);
  }

  /**
   * Archive a PIA with a given id
   * @param {string} id - The PIA id
   */
  archivePia(id: string) {
    localStorage.setItem('pia-to-archive-id', id);
    this._modalsService.openModal('modal-archive-pia');
  }
}
