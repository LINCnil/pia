import { Component, OnInit, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';

import { PiaService } from 'src/app/services/pia.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { ActionPlanService } from 'src/app/services/action-plan.service';
import { AttachmentsService } from 'src/app/services/attachments.service';
import { Pia } from 'src/app/models/pia.model';
import { DialogService } from 'src/app/services/dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-validate-pia',
  templateUrl: './validate-pia.component.html',
  styleUrls: ['./validate-pia.component.scss']
})
export class ValidatePIAComponent implements OnInit {
  @Input() pia: Pia = null;
  @Input() editMode:
    | 'local'
    | Array<'author' | 'evaluator' | 'validator' | 'guest'> = 'local';
  data: { sections: any };
  validateForm: UntypedFormGroup;
  attachment: any;
  removeAttachmentId = null;
  removeAttachmentForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    public attachmentsService: AttachmentsService,
    private actionPlanService: ActionPlanService,
    public piaService: PiaService,
    public languagesService: LanguagesService,
    private dialogService: DialogService
  ) {
    this.removeAttachmentForm = this.formBuilder.group({
      comment: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  async ngOnInit() {
    this.validateForm = new UntypedFormGroup({
      validateStatus1: new UntypedFormControl(),
      validateStatus2: new UntypedFormControl(),
      validateStatus3: new UntypedFormControl(),
      validateStatus4: new UntypedFormControl()
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

    await this.attachmentsService.updateSignedAttachmentsList(this.pia.id);
    this.actionPlanService.listActionPlan();

    // Check user role
    if (!this.editMode.includes('validator') && this.editMode != 'local') {
      this.validateForm.disable();
    }
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
    this.removeAttachmentId = id;
  }

  submitRemoveAttachment() {
    this.attachmentsService
      .removeAttachment(
        this.removeAttachmentId,
        this.removeAttachmentForm.controls['comment'].value
      )
      .then(() => {
        this.removeAttachmentId = null;
      });
  }

  /**
   * Locks radio buttons after click.
   * @param {any} event - Any Event.
   */
  lockStatus(event: any) {
    if (this.pia.status > 1 || this.pia.is_example === 1) {
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
    this.piaService.update(this.pia).then(() => {
      this.dialogService.confirmThis(
        {
          text: 'modals.simple_pia_validation.content',
          type: 'yes',
          yes: 'modals.back_to_home',
          no: '',
          icon: 'fa fa-check icon-green',
          data: {
            modal_id: 'validate-evaluation'
          }
        },
        () => {
          this.router.navigate(['/entries']);
        },
        () => {
          return;
        }
      );
    });
  }

  /**
   * Allows users to make a signed validation of a PIA.
   */
  signedPIAValidation() {
    this.pia.status = 3;
    this.piaService.update(this.pia).then(() => {
      this.dialogService.confirmThis(
        {
          text: 'modals.signed_pia_validation.content',
          type: 'yes',
          yes: 'modals.close',
          no: '',
          icon: 'fa fa-check icon-green'
        },
        () => {
          return;
        },
        () => {
          return;
        }
      );
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

    [].forEach.call(radioButtons, currentRadioBtn => {
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
