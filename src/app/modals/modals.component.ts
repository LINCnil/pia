import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ModalsService } from './modals.service';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { PiaService } from 'app/entry/pia.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';
import { FormControl, FormGroup } from '@angular/forms';

import { PiaModel, FolderModel } from '@api/models';
import { PiaApi, FolderApi } from '@api/services';
import { PiaType } from '@api/model/pia.model';


@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss'],
  providers: []
})
export class ModalsComponent implements OnInit {
  @Input() pia: any;
  newPia: PiaModel;
  newFolder: FolderModel;
  piaForm: FormGroup;
  folderForm: FormGroup;
  removeAttachmentForm: FormGroup;
  enableSubmit = true;
  piaTypes: any;

  constructor(
    private router: Router,
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    public _measuresService: MeasureService,
    public _attachmentsService: AttachmentsService,
    private piaApi: PiaApi,
    public _folderApi: FolderApi
  ) { }

  ngOnInit() {
    // this._piaService.getPIA();
    this.piaForm = new FormGroup({
      name: new FormControl(),
      author_name: new FormControl(),
      evaluator_name: new FormControl(),
      validator_name: new FormControl(),
      type: new FormControl()
    });
    this.folderForm = new FormGroup({
      name: new FormControl(),
    });
    this.removeAttachmentForm = new FormGroup({
      comment: new FormControl()
    });
    this.newPia = new PiaModel();
    this.newFolder = new FolderModel();

    this.piaTypes = Object.values(PiaType);
  }

  /**
   * Returns to homepage (used on several modals).
   * @memberof ModalsComponent
   */
  returnToHomepage() {
    this._modalsService.closeModal();
    this.router.navigate(['/home']);
  }

  /**
   * Save the newly created PIA.
   * Sends to the path associated to this new PIA.
   * @memberof ModalsComponent
   */
  onSubmit() {
    const pia = new PiaModel();
    pia.name = this.piaForm.value.name;
    pia.author_name = this.piaForm.value.author_name;
    pia.evaluator_name = this.piaForm.value.evaluator_name;
    pia.validator_name = this.piaForm.value.validator_name;
    pia.type = "advanced";//this.piaForm.value.type;

    this.piaApi.create(pia, this._piaService.currentFolder).subscribe((newPia: PiaModel) => {
      this.piaForm.reset();
      this.router.navigate(['entry', newPia.id, 'section', 1, 'item', 1]);
    });
  }

  /**
   * Save the newly created PIA.
   * Sends to the path associated to this new PIA.
   * @memberof ModalsComponent
   */
  onSubmitFolder() {
    const folder = new FolderModel();
    folder.name = this.folderForm.value.name;
    folder.parent = this._piaService.currentFolder;

    this._folderApi.create(folder).subscribe((newFolder: FolderModel) => {
      this._modalsService.closeModal();
      this.folderForm.reset();
      this._piaService.currentFolder.children.push(newFolder);
    });
  }

  /**
   * Focuses out from the comment attachment field.
   * @memberof ModalsComponent
   */
  attachmentCommentFocusOut() {
    if (this.removeAttachmentForm.controls['comment'].value &&
        this.removeAttachmentForm.controls['comment'].value.length > 0) {
      this.enableSubmit = false;
    }
  }
}
