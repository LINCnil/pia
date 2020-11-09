import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { PiaService } from 'src/app/services/pia.service';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { ModalsService } from 'src/app/services/modals.service';
import { Pia } from 'src/app/models/pia.model';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-refuse-pia',
  templateUrl: './refuse-pia.component.html',
  styleUrls: ['./refuse-pia.component.scss']
})
export class RefusePIAComponent implements OnInit {
  @Input() pia: Pia = null;
  rejectionReasonForm: FormGroup;
  rejectionState: boolean;
  showRejectionReasonButtons: boolean;
  showResendValidationButton: boolean;
  modificationsMadeForm: FormGroup;

  constructor(private router: Router,
              private el: ElementRef,
              private modalsService: ModalsService,
              private sidStatusService: SidStatusService,
              public piaService: PiaService,
              private dialogService: DialogService) { }

  ngOnInit() {
    this.rejectionReasonForm = new FormGroup({
      rejectionReason: new FormControl()
    });
    this.modificationsMadeForm = new FormGroup({
      modificationsMade: new FormControl()
    });

    if (this.pia.rejected_reason && this.pia.rejected_reason.length > 0) {
      this.rejectionReasonForm.controls['rejectionReason'].patchValue(this.pia.rejected_reason);
      this.rejectionReasonForm.controls['rejectionReason'].disable();
      this.showRejectionReasonButtons = true;
    }

    if (this.pia.applied_adjustements && this.pia.rejected_reason
        && this.pia.applied_adjustements.length > 0 && this.pia.rejected_reason.length > 0) {
      this.modificationsMadeForm.controls['modificationsMade'].patchValue(this.pia.applied_adjustements);
      this.modificationsMadeForm.controls['modificationsMade'].disable();
      if (this.pia.status === 1) {
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

  }

  /**
   * Display the modal to abandon the PIA.
   */
  abandon() {
    this.dialogService.confirmThis({
        text: 'modals.abandon_pia.content',
        type: 'confirm',
        yes: 'modals.archive',
        no: 'modals.cancel',
        data: {
          additional_text: 'modals.abandon_pia.additional_text'
        }
      },
      () => {
        this.piaService.abandonTreatment(this.pia);
      },
      () => {
        return;
      });
  }

  /**
   * Refuse the PIA and navigate to the root page of the PIA.
   */
  refuse() {
    this.pia.status = 1;
    this.piaService.update(this.pia).then(() => {
      this.piaService.cancelAllValidatedEvaluation(this.pia).then(() => {
        this.sidStatusService.refusePia(this.piaService).then(() => {
          this.router.navigate(['entry', this.pia.id, 'section', 1, 'item', 1]);
          this.modalsService.openModal('modal-refuse-pia');
        });
      });
    });
  }

  /**
   * Focuses rejection reason field.
   */
  rejectionReasonFocusIn(): boolean {
    if (this.pia.status === 1) {
      return false;
    } else {
      this.rejectionReasonForm.controls['rejectionReason'].enable();
      document.getElementById('pia-refuse-reason').focus();
    }
  }

  /**
   * Executes functionnalities when losing focus from rejection reason field.
   */
  rejectionReasonFocusOut(): void {
    let userText = this.rejectionReasonForm.controls['rejectionReason'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.pia.rejected_reason = userText;
    this.piaService.update(this.pia).then(() => {
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
   */
  modificationsMadeFocusIn(): boolean {
    if (this.pia.status !== 1) {
      return false;
    } else {
      this.modificationsMadeForm.controls['modificationsMade'].enable();
      document.getElementById('pia-refuse-modifications').focus();
    }
  }

  /**
   * Executes functionnalities when losing focus from modifications made field.
   */
  modificationsMadeFocusOut(): void {
    let userText = this.modificationsMadeForm.controls['modificationsMade'].value;
    const resendButton = this.el.nativeElement.querySelector('.pia-entryContentBlock-footer > button');
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.pia.applied_adjustements = userText;
    this.piaService.update(this.pia).then(() => {
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
   */
  autoTextareaResize(event: any, textarea?: HTMLElement): void {
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
