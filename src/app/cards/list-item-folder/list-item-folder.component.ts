import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Attachment } from 'app/entry/attachments/attachment.model';
import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';

import { FolderModel } from '@api/models';
import { FolderApi } from '@api/services';
import {PermissionsService} from '@security/permissions.service';

@Component({
  selector: `.app-list-item-folder`,
  templateUrl: './list-item-folder.component.html',
  styleUrls: ['./list-item-folder.component.scss']
})
export class ListItemFolderComponent implements OnInit {

  @Input() folder: FolderModel;
  public canCreatePIA: boolean;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private _modalsService: ModalsService,
    private folderApi: FolderApi,
    private permissionsService: PermissionsService
  ) { }

  ngOnInit() {
    // add permission verification
    const hasPerm$ = this.permissionsService.hasPermission('CanCreatePIA');
    hasPerm$.then((bool: boolean) => {
      this.canCreatePIA = bool;
    } );
  }

  /**
   * Focuses out field and update Folder.
   * @param {string} attribute - Attribute of the Folder.
   * @param {*} event - Any Event.
   * @memberof ListItemFolderComponent
   */
  onFocusOut(attribute: string, event: any) {
    const text = event.target.innerText;
    this.folderApi.get(this.folder.id).subscribe((theFolder: FolderModel) => {
      theFolder[attribute] = text;
      this.folderApi.update(theFolder).subscribe();
    });
  }

  /**
   * Opens the modal to confirm deletion of a Folder
   * @param {string} id - The Folder id.
   * @memberof ListItemFolderComponent
   */
  removeFolder(id: string) {
    localStorage.setItem('folder-id', id);
    this._modalsService.openModal('modal-remove-folder');
  }
}
