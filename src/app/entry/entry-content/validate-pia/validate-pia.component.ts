import { Component, OnInit, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { PiaService } from 'src/app/services/pia.service';
import { ModalsService } from 'src/app/modals/modals.service';
import { AttachmentsService } from 'src/app/entry/attachments/attachments.service';
import { ActionPlanService } from 'src/app/entry/entry-content/action-plan//action-plan.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'src/app/services/languages.service';

@Component({
  selector: 'app-validate-pia',
  templateUrl: './validate-pia.component.html',
  styleUrls: ['./validate-pia.component.scss'],
  providers: [PiaService]
})
export class ValidatePIAComponent implements OnInit {
  data: { sections: any };
  validateForm: FormGroup;
  attachment: any;

  constructor(
    private el: ElementRef,
    private _modalsService: ModalsService,
    public _attachmentsService: AttachmentsService,
    private _actionPlanService: ActionPlanService,
    private _translateService: TranslateService,
    public _piaService: PiaService,
    public _languagesService: LanguagesService
  ) {}

  ngOnInit() {
    this.validateForm = new FormGroup({
      validateStatus1: new FormControl(),
      validateStatus2: new FormControl(),
      validateStatus3: new FormControl(),
      validateStatus4: new FormControl()
    });
    this._piaService.getPIA().then(() => {
      this.validateForm.controls['validateStatus1'].patchValue(
        this._piaService.pia.status > 1
      );
      this.validateForm.controls['validateStatus2'].patchValue(
        this._piaService.pia.status > 1
      );
      this.validateForm.controls['validateStatus3'].patchValue(
        this._piaService.pia.status > 1
      );
      this.validateForm.controls['validateStatus4'].patchValue(
        this._piaService.pia.status > 1
      );

      this._attachmentsService.updateSignedAttachmentsList();
      this._actionPlanService.listActionPlan();
    });
  }

  /**
   * Open the dialog box to select an attachment to upload
   */
  addAttachment() {
    const attachment: any = document.querySelector(
      '[formcontrolname="attachment_file"]'
    );
    this._attachmentsService.pia_signed = 1;
    attachment.click();
  }

  /**
   * Download an attachment
   * @param {number} id - Attachment id.
   */
  downloadAttachment(id: number) {
    this._attachmentsService.downloadAttachment(id);
  }

  /**
   * Destroy an attachment
   * @param {number} id - Attachment id.
   */
  removeAttachment(id: number) {
    localStorage.setItem('attachment-id', id.toString());
    this._modalsService.openModal('modal-remove-attachment');
  }

  /**
   * Locks radio buttons after click.
   * @param {any} event - Any Event.
   */
  lockStatus(event: any) {
    if (
      this._piaService.pia.status > 1 ||
      this._piaService.pia.is_example === 1
    ) {
      return false;
    } else {
      const clickedRadioButton =
        event.target || event.srcElement || event.currentTarget;
      clickedRadioButton.setAttribute('disabled', true);
      this.checkValidationFormStatus();
    }
  }

  /**
   * Allows users to make a simple validation of a PIA.
   */
  simplePIAValidation() {
    this._piaService.pia.status = 2;
    this._piaService.pia.update().then(() => {
      this._modalsService.openModal('modal-simple-pia-validation');
    });
  }

  /**
   * Allows users to make a signed validation of a PIA.
   */
  signedPIAValidation() {
    this._piaService.pia.status = 3;
    this._piaService.pia.update().then(() => {
      this._modalsService.openModal('modal-signed-pia-validation');
    });
  }

  /**
   * Checks if the form is valid (radio buttons all checked).
   * If so, enables validation buttons.
   */
  private checkValidationFormStatus() {
    let allBtnChecked = true;
    const radioButtons = document.querySelectorAll(
      '.pia-entryContentBlock-content-list-confirm input'
    );
    const simpleValidationBtn = document.getElementById(
      'pia-simple-validation'
    );
    const signValidationBtn = document.getElementById('pia-sign-validation');

    [].forEach.call(radioButtons, function(currentRadioBtn) {
      if (!currentRadioBtn.checked) {
        allBtnChecked = false;
      }
    });
    if (allBtnChecked) {
      simpleValidationBtn.removeAttribute('disabled');
      signValidationBtn.removeAttribute('disabled');
    }
  }
}
