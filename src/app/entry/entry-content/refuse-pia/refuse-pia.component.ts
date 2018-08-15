import { Component, ElementRef, OnInit, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/services/pia.service';
import { SidStatusService } from 'app/services/sid-status.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-refuse-pia',
  templateUrl: './refuse-pia.component.html',
  styleUrls: ['./refuse-pia.component.scss']
})
export class RefusePIAComponent implements OnInit {

  rejectionReasonForm: FormGroup;
  rejectionState: boolean;
  showRejectionReasonButtons: boolean;
  showResendValidationButton: boolean;
  modificationsMadeForm: FormGroup;

  constructor(private router: Router,
              private el: ElementRef,
              private _modalsService: ModalsService,
              private _sidStatusService: SidStatusService,
              private _translateService: TranslateService,
              public _piaService: PiaService) { }

  ngOnInit() {
    this.rejectionReasonForm = new FormGroup({
      rejectionReason: new FormControl()
    });
    this.modificationsMadeForm = new FormGroup({
      modificationsMade: new FormControl()
    });

    this._piaService.getPIA().then(() => {
      if (this._piaService.pia.rejected_reason && this._piaService.pia.rejected_reason.length > 0) {
        this.rejectionReasonForm.controls['rejectionReason'].patchValue(this._piaService.pia.rejected_reason);
        this.rejectionReasonForm.controls['rejectionReason'].disable();
        this.showRejectionReasonButtons = true;
      }

      if (this._piaService.pia.applied_adjustements && this._piaService.pia.rejected_reason
          && this._piaService.pia.applied_adjustements.length > 0 && this._piaService.pia.rejected_reason.length > 0) {
        this.modificationsMadeForm.controls['modificationsMade'].patchValue(this._piaService.pia.applied_adjustements);
        this.modificationsMadeForm.controls['modificationsMade'].disable();
        if (this._piaService.pia.status === 1) {
          this.showResendValidationButton = true;
        }
      }

      // Textareas auto resize
      const rejectionTextarea = document.getElementById('pia-refuse-reason');
      if (rejectionTextarea) {
        this.autoTextareaResize(null, rejectionTextarea);
      }
      const modificationsTextarea = document.getElementById('pia-refuse-modifications');
      if (modificationsTextarea) {
        this.autoTextareaResize(null, modificationsTextarea);
      }
    });

  }

  /**
   * Display the modal to abandon the PIA.
   * @memberof RefusePIAComponent
   */
  abandon() {
    this._modalsService.openModal('modal-abandon-pia');
  }

  /**
   * Refuse the PIA and navigate to the root page of the PIA.
   * @memberof RefusePIAComponent
   */
  refuse() {
    this._piaService.pia.status = 1;
    this._piaService.pia.update().then(() => {
      this._piaService.cancelAllValidatedEvaluation().then(() => {
        this._sidStatusService.refusePia(this._piaService).then(() => {
          this.router.navigate(['entry', this._piaService.pia.id, 'section', 1, 'item', 1]);
          this._modalsService.openModal('modal-refuse-pia');
        });
      });
    });
  }

  /**
   * Focuses rejection reason field.
   * @memberof RefusePIAComponent
   */
  rejectionReasonFocusIn() {
    if (this._piaService.pia.status === 1) {
      return false;
    } else {
      this.rejectionReasonForm.controls['rejectionReason'].enable();
      document.getElementById('pia-refuse-reason').focus();
    }
  }

  /**
   * Executes functionnalities when losing focus from rejection reason field.
   * @memberof RefusePIAComponent
   */
  rejectionReasonFocusOut() {
    let userText = this.rejectionReasonForm.controls['rejectionReason'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this._piaService.pia.rejected_reason = userText;
    this._piaService.pia.update().then(() => {
      if (userText && userText.length > 0) {
        this.rejectionReasonForm.controls['rejectionReason'].disable();
        this.showRejectionReasonButtons = true;
      } else {
        this.showRejectionReasonButtons = false;
      }
    });
  }

  /**
   * Focuses modification made field.
   * @memberof RefusePIAComponent
   */
  modificationsMadeFocusIn() {
    if (this._piaService.pia.status !== 1) {
      return false;
    } else {
      this.modificationsMadeForm.controls['modificationsMade'].enable();
      document.getElementById('pia-refuse-modifications').focus();
    }
  }

  /**
   * Executes functionnalities when losing focus from modifications made field.
   * @memberof RefusePIAComponent
   */
  modificationsMadeFocusOut() {
    let userText = this.modificationsMadeForm.controls['modificationsMade'].value;
    const resendButton = this.el.nativeElement.querySelector('.pia-entryContentBlock-footer > button');
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this._piaService.pia.applied_adjustements = userText;
    this._piaService.pia.update().then(() => {
      if (userText && userText.length > 0) {
        this.modificationsMadeForm.controls['modificationsMade'].disable();
        this.showResendValidationButton = true;
      } else {
        this.showResendValidationButton = false;
      }
      if (resendButton) {
        if (userText) {
          resendButton.removeAttribute('disabled');
        } else {
          resendButton.setAttribute('disabled', true);
        }
      }
    });
  }

  /**
   * Enable auto resizing on tetarea
   * @param {*} event - Any Event.
   * @param {HTMLElement} textarea - Texarea element.
   * @memberof RefusePIAComponent
   */
  autoTextareaResize(event: any, textarea?: HTMLElement) {
    if (event) {
      textarea = event.target;
    }
    if (textarea.clientHeight < textarea.scrollHeight) {
      textarea.style.height = textarea.scrollHeight + 'px';
      if (textarea.clientHeight < textarea.scrollHeight) {
        textarea.style.height = (textarea.scrollHeight * 2 - textarea.clientHeight) + 'px';
      }
    }
  }
}
