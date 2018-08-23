import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Attachment } from 'app/entry/attachments/attachment.model';
import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';

import {PiaModel, AttachmentModel} from '@api/models';
import {PiaApi, AttachmentApi} from '@api/services';
import {PermissionsService} from '@security/permissions.service';

@Component({
  selector: `.app-list-item`,
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent implements OnInit {
  @Input() pia: any;
  attachments: any;
  public canCreatePIA: boolean;

  constructor(private router: Router,
              private route: ActivatedRoute,
              public _piaService: PiaService,
              private _modalsService: ModalsService,
              private piaApi: PiaApi,
              private attachmentApi: AttachmentApi,
              private permissionsService: PermissionsService
            ) { }

  ngOnInit() {
    // add permission verification
    const hasPerm$ = this.permissionsService.hasPermission('CanCreatePIA');
    hasPerm$.then((bool: boolean) => {
      this.canCreatePIA = bool;
    } );
    this.attachmentApi.getAll(this.pia.id).subscribe((entries: AttachmentModel[]) => {
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
    this.piaApi.update(this.pia).subscribe();
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
