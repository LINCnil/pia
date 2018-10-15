import { Component, OnInit, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, NgForm } from '@angular/forms';
import { FolderApi } from '@api/services';
import { FolderModel } from '@api/models';
import { ModalsService } from '../../modals/modals.service';
import {PermissionsService} from '@security/permissions.service';

@Component({
  selector: 'app-folder-item',
  templateUrl: './folder-item.component.html',
  styleUrls: ['./folder-item.component.scss']
})
export class FolderItemComponent implements OnInit {
  @Input() folder;
  @Input() previousFolder;
  editor: any;
  elementId: string;
  @ViewChild('folderForm') folderForm: NgForm;

  constructor(
    private folderApi: FolderApi,
    private _modalsService: ModalsService,
    private permissionsService: PermissionsService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // add permission verification
    const hasPerm$ = this.permissionsService.hasPermission('CanCreatePIA');
    hasPerm$.then((bool: boolean) => {
      // tslint:disable-next-line:forin
      for (const field in this.folderForm.controls) {
          const fc = this.folderForm.form.get(field);
          bool ? fc.enable() : fc.disable();
      }
    } );
  }

  /**
   * Update folder model
   */
  updateFolder() {
    this.folderApi.get(this.folder.structure_id, this.folder.id).subscribe((theFolder: FolderModel) => {
      this.folder.parent = theFolder.parent;
      this.folderApi.update(this.folder).subscribe();
    });
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
      this.folder.name = userText;
      this.updateFolder();
    }
  }

  removeFolder(folder: FolderModel) {
    // @todo waiting for modal refactoring
    localStorage.setItem('folder-id', folder.id);
    // @note structure-id is already set by ProfileSession
    this._modalsService.openModal('modal-remove-folder');
  }

   /**
   * Check permissions and open editor to edit field content
   *
   * @param {any} element
   * @param {string[]} knowledgeBaseItemIdentifier
   * @memberof ProcessingFormComponent
   */
  editField(element: any) {
    this.permissionsService.hasPermission('CanEditStructure').then((hasPerm: boolean) => {
      if (hasPerm) {
        this.elementId = element.id;
        this.loadEditor(element);
      }
    });
  }

  /**
   * Load wysiwyg editor.
   *
   * @private
   * @param element
   * @memberof FolderItemComponent
   */
  private loadEditor(element: any) {
    tinymce.init({
      branding: false,
      menubar: false,
      statusbar: false,
      plugins: 'autoresize lists',
      forced_root_block: false,
      autoresize_bottom_margin: 30,
      auto_focus: element.id,
      autoresize_min_height: 40,
      content_style: 'body {background-color:#eee!important;}',
      selector: '#' + element.id,
      toolbar: 'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      skin_url: 'assets/skins/lightgray',
      setup: editor => {
        this.editor = editor;

        editor.on('focusout', () => {
          const content = editor.getContent();

          this.folderForm.form.controls[element.name].patchValue(content);

          this.closeEditor();
          this.updateFolder();
          // Hack to trigger view update
          this.ref.detectChanges();
        });
      },
    });
  }

  /**
   * Close wysiwig editor
   *
   * @private
   * @memberof FolderItemComponent
   */
  private closeEditor() {
    tinymce.remove(this.editor);
    this.editor = null;
  }
}
