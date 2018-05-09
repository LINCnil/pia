import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ModalsService } from './modals.service';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { PiaService } from 'app/entry/pia.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';
import { FormControl, FormGroup } from '@angular/forms';

import { PiaModel } from '@api/models';
import { PiaApi } from '@api/services';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss'],
  providers: []
})
export class ModalsComponent implements OnInit {
  @Input() pia: any;
  newPia: PiaModel;
  piaForm: FormGroup;
  removeAttachmentForm: FormGroup;
  enableSubmit = true;

  constructor(
    private router: Router,
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    public _measuresService: MeasureService,
    public _attachmentsService: AttachmentsService,
    private piaApi: PiaApi
  ) { }

  ngOnInit() {
    //this._piaService.getPIA();
    this.piaForm = new FormGroup({
      name: new FormControl(),
      author_name: new FormControl(),
      evaluator_name: new FormControl(),
      validator_name: new FormControl()
    });
    this.removeAttachmentForm = new FormGroup({
      comment: new FormControl()
    });
    this.newPia = new PiaModel();
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

    this.piaApi.create(pia).subscribe((newPia: PiaModel) => {
      this.router.navigate(['entry', newPia.id, 'section', 1, 'item', 1]);
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
