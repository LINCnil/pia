import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Attachment } from 'app/entry/attachments/attachment.model';
import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';

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
              private _piaService: PiaService,
              private _modalsService: ModalsService) { }

  ngOnInit() {
    const attachmentModel = new Attachment();
    attachmentModel.pia_id = this.pia.id;
    attachmentModel.findAll().then((entries: any) => {
      this.attachments = entries;
    });
  }

  editPia() {
    this.router.navigate(['entry', this.pia.id, 'section', 1, 'item', 1]);
  }

  removePia(id: string) {
    localStorage.setItem('pia-id', id);
    this._modalsService.openModal('modal-remove-pia');
  }

  export(id: number) {
    this._piaService.export(id);
  }
}
