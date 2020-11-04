import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { PiaService } from 'src/app/services/pia.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'src/app/services/languages.service';
import { ActionPlanService } from 'src/app/services/action-plan.service';
import { AttachmentsService } from 'src/app/services/attachments.service';
import { ModalsService } from 'src/app/services/modals.service';
import { Pia } from 'src/app/models/pia.model';

@Component({
  selector: 'app-validate-pia',
  templateUrl: './validate-pia.component.html',
  styleUrls: ['./validate-pia.component.scss'],
  providers: [PiaService]
})
export class ValidatePIAComponent implements OnInit {
  @Input() pia: Pia = null;
  data: { sections: any };
  validateForm: FormGroup;
  attachment: any;

  constructor(
    private modalsService: ModalsService,
    public attachmentsService: AttachmentsService,
    private actionPlanService: ActionPlanService,
    public piaService: PiaService,
    public languagesService: LanguagesService
  ) {}

  ngOnInit() {
    this.validateForm = new FormGroup({
      validateStatus1: new FormControl(),
      validateStatus2: new FormControl(),
      validateStatus3: new FormControl(),
      validateStatus4: new FormControl()
    });

    this.validateForm.controls['validateStatus1'].patchValue(
      this.pia.status > 1
    );
    this.validateForm.controls['validateStatus2'].patchValue(
      this.pia.status > 1
    );
    this.validateForm.controls['validateStatus3'].patchValue(
      this.pia.status > 1
    );
    this.validateForm.controls['validateStatus4'].patchValue(
      this.pia.status > 1
    );

    this.attachmentsService.updateSignedAttachmentsList();
    this.actionPlanService.listActionPlan();
  }

  /**
   * Open the dialog box to select an attachment to upload
   */
  addAttachment() {
    const attachment: any = document.querySelector(
      '[formcontrolname="attachment_file"]'
    );
    this.attachmentsService.pia_signed = 1;
    attachment.click();
  }

  /**
   * Download an attachment
   * @param {number} id - Attachment id.
   */
  downloadAttachment(id: number) {
    this.attachmentsService.downloadAttachment(id);
  }

  /**
   * Destroy an attachment
   * @param {number} id - Attachment id.
   */
  removeAttachment(id: number) {
    localStorage.setItem('attachment-id', id.toString());
    this.modalsService.openModal('modal-remove-attachment');
  }

  /**
   * Locks radio buttons after click.
   * @param {any} event - Any Event.
   */
  lockStatus(event: any) {
    if (
      this.pia.status > 1 ||
      this.pia.is_example === 1
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
    this.pia.status = 2;
    this.pia.update().then(() => {
      this.modalsService.openModal('modal-simple-pia-validation');
    });
  }

  /**
   * Allows users to make a signed validation of a PIA.
   */
  signedPIAValidation() {
    this.pia.status = 3;
    this.pia.update().then(() => {
      this.modalsService.openModal('modal-signed-pia-validation');
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

    [].forEach.call(radioButtons, (currentRadioBtn) => {
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
