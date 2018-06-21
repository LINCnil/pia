import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FolderApi } from '@api/services';
import { FolderModel } from '@api/models';
import { PiaService } from '../../entry/pia.service';
import { ModalsService } from '../../modals/modals.service';
import {PermissionsService} from '@security/permissions.service';

@Component({
  selector: 'app-folder-item',
  templateUrl: './folder-item.component.html',
  styleUrls: ['./folder-item.component.scss']
})
export class FolderItemComponent implements OnInit {
  @Input() folder
  @Input() previousFolder

  folderForm: FormGroup

  constructor(
    private folderApi: FolderApi,
    private _piaService: PiaService,
    private _modalsService: ModalsService,
    private permissionsService: PermissionsService
  ) { }

  ngOnInit() {
    this.folderForm = new FormGroup({
      name: new FormControl(this.folder.name)
    });

    // add permission verification
    const hasPerm$ = this.permissionsService.hasPermission('CanCreatePIA');
    hasPerm$.then((bool: boolean) => {
      for (const field in this.folderForm.controls) {
          const fc = this.folderForm.get(field);
          bool ? fc.enable() : fc.disable();
      }
    } );
  }

  /**
   * Disables folder name field and saves data.
   * @memberof FolderItemComponent
   */
  folderNameFocusOut() {
    let userText = this.folderForm.controls['name'].value;
    if (userText  && typeof userText === 'string') {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, ''); // trim value
    }
    if (userText !== '') {

      this.folderApi.get(this.folder.id).subscribe((theFolder: FolderModel) => {
        theFolder.name = userText;
        this.folderApi.update(theFolder).subscribe();
      });
    }
  }

  removeFolder(folder: FolderModel) {
    localStorage.setItem('folder-id', folder.id);
    this._modalsService.openModal('modal-remove-folder');
  }
}
