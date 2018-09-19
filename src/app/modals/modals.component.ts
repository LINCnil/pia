import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ModalsService } from './modals.service';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { PiaService } from 'app/entry/pia.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';
import { FormControl, FormGroup } from '@angular/forms';

import { PiaModel, FolderModel, ProcessingModel } from '@api/models';
import { PiaApi, FolderApi, ProcessingApi } from '@api/services';
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
  newProcessing: ProcessingModel;
  newFolder: FolderModel;
  piaForm: FormGroup;
  processingForm: FormGroup;
  folderForm: FormGroup;
  removeAttachmentForm: FormGroup;
  enableSubmit = true;
  piaTypes: any;

  constructor(
    private router: Router,
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    public _processingApi: ProcessingApi,
    public _measuresService: MeasureService,
    public _attachmentsService: AttachmentsService,
    private piaApi: PiaApi,
    public _folderApi: FolderApi
  ) { }

  ngOnInit() {
    this.piaForm = new FormGroup({
      author_name: new FormControl(),
      evaluator_name: new FormControl(),
      validator_name: new FormControl(),
      type: new FormControl()
    });

    this.processingForm = new FormGroup({
      name: new FormControl(),
      author: new FormControl(),
      designated_controller: new FormControl()
    });

    this.folderForm = new FormGroup({
      name: new FormControl(),
    });

    this.removeAttachmentForm = new FormGroup({
      comment: new FormControl()
    });

    this.newPia = new PiaModel();
    this.newFolder = new FolderModel();
    this.newProcessing = new ProcessingModel();

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
    pia.author_name = this.piaForm.value.author_name;
    pia.evaluator_name = this.piaForm.value.evaluator_name;
    pia.validator_name = this.piaForm.value.validator_name;
    // disable the type feature
    pia.type = 'advanced'; // this.piaForm.value.type;
    pia.processing = this._piaService.currentProcessing;

    this.piaApi.create(pia).subscribe((newPia: PiaModel) => {
      this.piaForm.reset();
      this.router.navigate(['entry', newPia.id, 'section', 3, 'item', 1]);
    });
  }

  /**
   * Save the newly created Processing.
   * Sends to the path associated to this new Processing.
   * @memberof ModalsComponent
   */
  onSubmitProcessing() {
    const processing = new ProcessingModel();
    processing.name = this.processingForm.value.name;
    processing.author = this.processingForm.value.author;
    processing.designated_controller = this.processingForm.value.designated_controller;

    this._processingApi.create(processing, this._piaService.currentFolder).subscribe((newProcessing: ProcessingModel) => {
      this.piaForm.reset();
      this.router.navigate(['processing', newProcessing.id]);
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
    folder.structure_id = folder.parent.structure_id;

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
