import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { PiaService } from 'src/app/services/pia.service';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { Pia } from 'src/app/models/pia.model';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-refuse-pia',
  templateUrl: './refuse-pia.component.html',
  styleUrls: ['./refuse-pia.component.scss']
})
export class RefusePIAComponent implements OnInit {
  @Input() pia: Pia;
  @Input() editMode:
    | 'local'
    | Array<'author' | 'evaluator' | 'validator' | 'guest'> = 'local';
  rejectionReasonForm: UntypedFormGroup;
  rejectionState: boolean;
  showRejectionReasonButtons: boolean;
  showResendValidationButton: boolean;
  modificationsMadeForm: UntypedFormGroup;

  constructor(
    private router: Router,
    private el: ElementRef,
    private sidStatusService: SidStatusService,
    public piaService: PiaService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.rejectionReasonForm = new UntypedFormGroup({
      rejectionReason: new UntypedFormControl(this.pia.rejection_reason)
    });

    this.modificationsMadeForm = new UntypedFormGroup({
      modificationsMade: new UntypedFormControl(this.pia.applied_adjustments)
    });

    if (this.pia.rejection_reason) {
      this.showRejectionReasonButtons = true;
      if (this.pia.applied_adjustments && this.pia.status === 1) {
        this.showResendValidationButton = true;
      }
    }

    // Textareas auto resize
    const rejectionTextarea = document.getElementById('pia-refuse-reason');
    if (rejectionTextarea) {
      this.autoTextareaResize(null, rejectionTextarea);
    }
    const modificationsTextarea = document.getElementById(
      'pia-refuse-modifications'
    );
    if (modificationsTextarea) {
      this.autoTextareaResize(null, modificationsTextarea);
    }

    // Check user role
    if (!this.editMode.includes('validator') && this.editMode != 'local') {
      this.rejectionReasonForm.disable();
      this.modificationsMadeForm.disable();
    }
  }

  /**
   * Display the modal to abandon the PIA.
   */
  abandon() {
    this.dialogService.confirmThis(
      {
        text: 'modals.abandon_pia.content',
        type: 'confirm',
        yes: 'modals.archive',
        no: 'modals.cancel',
        icon: 'fa fa-times icon-red',
        data: {
          additional_text: 'modals.abandon_pia.additional_text',
          btn_yes: 'btn-red'
        }
      },
      () => {
        this.piaService.abandonTreatment(this.pia).then(dataUpdated => {
          if (dataUpdated.lock_version) {
            // Update lock_version
            this.pia.lock_version = dataUpdated.lock_version;
          }
        });
      },
      () => {
        return;
      }
    );
  }

  /**
   * Refuse the PIA and navigate to the root page of the PIA.
   */
  refuse() {
    this.pia.status = 1;
    this.piaService.update(this.pia).then(() => {
      this.piaService.cancelAllValidatedEvaluation(this.pia).then(() => {
        this.sidStatusService.refusePia(this.pia.id).then(() => {
          this.dialogService.confirmThis(
            {
              text: 'modals.refuse_pia.content',
              type: 'yes',
              yes: 'modals.continue',
              no: '',
              icon: 'pia-icons fa fa-cog icon-red',
              data: {
                modal_id: 'modal-refuse-pia',
                btn_yes: 'btn-red'
              }
            },
            () => {
              this.piaService
                .resetDpoPage(this.pia.id)
                .then(dataUpdated => {
                  if (dataUpdated.lock_version) {
                    // Update lock_version
                    this.pia.lock_version = dataUpdated.lock_version;
                  }
                  this.router.navigate([
                    '/pia',
                    this.pia.id,
                    'section',
                    1,
                    'item',
                    1
                  ]);
                })
                .catch(err => {
                  console.log(err);
                });
            },
            () => {
              return false;
            }
          );
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
   * Executes functionalities when losing focus from rejection reason field.
   */
  rejectionReasonFocusOut(): void {
    let userText = this.rejectionReasonForm.controls['rejectionReason'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.pia.rejection_reason = userText;
    this.piaService
      .update(this.pia)
      .then(dataUpdated => {
        if (dataUpdated.lock_version) {
          // Update lock_version
          this.pia.lock_version = dataUpdated.lock_version;
        }
        if (userText && userText.length > 0) {
          this.showRejectionReasonButtons = true;
        } else {
          this.showRejectionReasonButtons = false;
        }
      })
      .catch(() => {});
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
   * Executes functionalities when losing focus from modifications made field.
   */
  modificationsMadeFocusOut(): void {
    let userText = this.modificationsMadeForm.controls['modificationsMade']
      .value;
    const resendButton = this.el.nativeElement.querySelector(
      '.pia-entryContentBlock-footer > button'
    );
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.pia.applied_adjustments = userText;
    this.piaService
      .update(this.pia)
      .then(dataUpdated => {
        if (dataUpdated.lock_version) {
          // Update lock_version
          this.pia.lock_version = dataUpdated.lock_version;
        }
        if (userText && userText.length > 0) {
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
      })
      .catch(() => {});
  }

  /**
   * Enable auto resizing on textarea
   * @param event - Any Event.
   * @param extarea - Texarea element.
   */
  autoTextareaResize(event: any, textarea?: HTMLElement): void {
    if (event) {
      textarea = event.target;
    }
    if (textarea.clientHeight < textarea.scrollHeight) {
      textarea.style.height = textarea.scrollHeight + 'px';
      if (textarea.clientHeight < textarea.scrollHeight) {
        textarea.style.height =
          textarea.scrollHeight * 2 - textarea.clientHeight + 'px';
      }
    }
  }
}
