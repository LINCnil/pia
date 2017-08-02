import { Component, ElementRef, OnInit, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ModalsService } from 'app/modals/modals.service';
import {Pia} from 'app/entry/pia.model';
import { PiaService } from 'app/entry/pia.service';

@Component({
  selector: 'app-refuse-pia',
  templateUrl: './refuse-pia.component.html',
  styleUrls: ['./refuse-pia.component.scss']
})
export class RefusePIAComponent implements OnInit {

  @Input() pia: any;
  rejectionReasonForm: FormGroup;
  rejectionState: boolean;
  showRejectionReasonButtons: boolean;
  showResendValidationButton: boolean;
  modificationsMadeForm: FormGroup;

  constructor(private el: ElementRef,
              private _modalsService: ModalsService,
              private _piaService: PiaService) { }

  ngOnInit() {
    this.rejectionReasonForm = new FormGroup({
      rejectionReason: new FormControl({ value: this.pia.rejected_reason, disabled: false })
    });
    this.modificationsMadeForm = new FormGroup({
      modificationsMade: new FormControl( { value: this.pia.applied_adjustements, disabled: false })

    });

    this._piaService.getPIA().then(() => {
      if (this._piaService.pia.rejected_reason && this._piaService.pia.status === 1) {
        this.rejectionReasonForm.controls['rejectionReason'].patchValue(this._piaService.pia.rejected_reason);
        this.showRejectionReasonEditButton();
        this.showRejectionReasonButtons = true;
        this.rejectionReasonForm.controls['rejectionReason'].disable();
      }

      if (this._piaService.pia.applied_adjustements && ((this._piaService.pia.status === 2 || this._piaService.pia.status === 3) &&
          this._piaService.pia.rejected_reason)) {
        this.modificationsMadeForm.controls['modificationsMade'].patchValue(this._piaService.pia.applied_adjustements);
        this.showModificationsMadeEditButton();
        this.showResendValidationButton = true;
        this.modificationsMadeForm.controls['modificationsMade'].disable();
      }
    });

  }

  /**
   * Executes functionnalities when focusing rejection reason field.
   */
  rejectionReasonFocus() {
    this.hideRejectionReasonEditButton();
  }

  /**
   * Executes functionnalities when losing focus from rejection reason field.
   */
  rejectionReasonFocusOut() {
    const rejectionReasonValue = this.rejectionReasonForm.value.rejectionReason;
    const modificationsMadeValue = this.modificationsMadeForm.value.modificationsMade;
    setTimeout(() => {
      if (rejectionReasonValue && rejectionReasonValue.length > 0 && document.activeElement.id !== 'pia-modifications-made') {
        this.showRejectionReasonEditButton();
        this.rejectionReasonForm.controls['rejectionReason'].disable();
        this.showRejectionReasonButtons = true;
      } else {
        this.showRejectionReasonButtons = false;
      }
    }, 1);
    const pia = new Pia();
    pia.id = this._piaService.pia.id;
    pia.get(pia.id).then(() => {
      pia.rejected_reason = this.rejectionReasonForm.value.rejectionReason;
      pia.update()
    });
  }

  /**
   * Shows edit button for rejection reason field.
   */
  showRejectionReasonEditButton() {
    const editButton1 = document.getElementById('rejection-reason-btn');
    editButton1.classList.remove('hide');
  }

  /**
   * Hide edit button for rejection reason field.
   */
  hideRejectionReasonEditButton() {
    const editButton1 = document.getElementById('rejection-reason-btn');
    editButton1.classList.add('hide');
  }

  /**
   * Enable rejection reason and modification made fields
   */
  activateRejectionReasonEdition() {
    this.hideRejectionReasonEditButton();
    this.rejectionReasonForm.controls['rejectionReason'].enable();
  }

  /**
   * Executes functionnalities when focusing modifications made field.
   */
  modificationsMadeFocus() {
    this.hideModificationsMadeEditButton();
  }

  /**
   * Executes functionnalities when losing focus from modifications made field.
   */
  modificationsMadeFocusOut() {
    const modificationsMadeValue = this.modificationsMadeForm.value.modificationsMade
    const resendButton = this.el.nativeElement.querySelector('.pia-entryContentBlock-footer > button');
    setTimeout(() => {
      if (modificationsMadeValue && modificationsMadeValue.length > 0 && document.activeElement.id !== 'pia-rejection-reason') {
        this.showModificationsMadeEditButton();
        this.modificationsMadeForm.controls['modificationsMade'].disable();
        this.showResendValidationButton = true;
      } else {
        this.showResendValidationButton = false;
      }
      if (modificationsMadeValue) {
        resendButton.removeAttribute('disabled');
      } else {
        resendButton.setAttribute('disabled', true);
      }
    }, 1);
    const pia = new Pia();
    pia.id = this._piaService.pia.id;
    pia.get(pia.id).then(() => {
      pia.applied_adjustements = this.modificationsMadeForm.value.modificationsMade;
      pia.update();
    });
  }

  /**
   * Shows edit button for modifications made field.
   */
  showModificationsMadeEditButton() {
    const editButton2 = document.getElementById('modifications-made-btn');
    editButton2.classList.remove('hide');
  }

  /**
   * Hide edit button for modifications made field.
   */
  hideModificationsMadeEditButton() {
    const editButton2 = document.getElementById('modifications-made-btn');
    editButton2.classList.add('hide');
  }

  /**
   * Enable rejection reason and modification made fields
   */
  activateModificationsMadeEdition() {
    this.hideModificationsMadeEditButton();
    this.modificationsMadeForm.controls['modificationsMade'].enable();
  }

  /**
   * Displays the rejection reason form.
   * @return true if the PIA is refused, false otherwise.
   */
  showRejectionReasonForm() {
    return (this._piaService.pia.status === 1);
  }

  /**
   * Displays the refuse buttons.
   * @return true if the PIA is refused, false otherwise.
   */
  showRefuseButtons() {
    return (this._piaService.pia.status === 1);
  }

  /**
   * Displays the modifications made form.
   * @return true if the PIA is validated and that there was a rejection before this validation, false otherwise.
   */
  showModificationsMadeForm() {
    return ((this._piaService.pia.status === 2 || this._piaService.pia.status === 3) &&
            this._piaService.pia.rejected_reason);
  }

  /**
   * Displays the resend validation button.
   * @return true if the PIA is validated but has been refused previously (a rejected reason was specified), false otherwise.
   */
  showResendForValidationButton() {
    return ((this._piaService.pia.status === 2 || this._piaService.pia.status === 3) &&
            this._piaService.pia.rejected_reason);
  }

}
