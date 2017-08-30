import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PiaService } from 'app/entry/pia.service';
import { ModalsService } from 'app/modals/modals.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';

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

  constructor(private el: ElementRef,
              private _modalsService: ModalsService,
              private _attachmentsService: AttachmentsService,
              private _piaService: PiaService ) {
  }

  ngOnInit() {
    this.validateForm = new FormGroup({
      validateStatus1: new FormControl(),
      validateStatus2: new FormControl(),
      validateStatus3: new FormControl(),
      validateStatus4: new FormControl()
    });
    this._piaService.getPIA().then(() => {
      this.validateForm.controls['validateStatus1'].patchValue(this._piaService.pia.status > 1);
      this.validateForm.controls['validateStatus2'].patchValue(this._piaService.pia.status > 1);
      this.validateForm.controls['validateStatus3'].patchValue(this._piaService.pia.status > 1);
      this.validateForm.controls['validateStatus4'].patchValue(this._piaService.pia.status > 1);
      this._attachmentsService.setSignedPia();
    });
  }

  addAttachment() {
    const attachment: any = document.querySelector('[formcontrolname="attachment_file"]');
    this._attachmentsService.pia_signed = 1;
    attachment.click();
  }

  downloadAttachment(id: number) {
    this._attachmentsService.downloadAttachment(id);
  }

  removeAttachment(id: number) {
    localStorage.setItem('attachment-id', id.toString());
    this._modalsService.openModal('modal-remove-attachment');
  }

  /**
   * Checks if the form is valid (radio buttons all checked).
   * If so, enables validation buttons.
   */
  checkValidationFormStatus() {
    let allBtnChecked = true;
    const radioButtons = document.querySelectorAll('.pia-entryContentBlock-content-list-confirm input');
    const simpleValidationBtn = document.getElementById('pia-simple-validation');
    const signValidationBtn = document.getElementById('pia-sign-validation');

    [].forEach.call(radioButtons, function (currentRadioBtn) {
      if (!currentRadioBtn.checked) {
        allBtnChecked = false;
      }
    });

    if (allBtnChecked) {
      simpleValidationBtn.removeAttribute('disabled');
      signValidationBtn.removeAttribute('disabled');
    }
  }

  /**
   * Locks radio buttons after click.
   */
  lockStatus(event) {
    const clickedRadioButton = event.target || event.srcElement || event.currentTarget;
    clickedRadioButton.setAttribute('disabled', true);
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
}
