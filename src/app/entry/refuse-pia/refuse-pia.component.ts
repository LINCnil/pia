import {Component, ElementRef, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import { ModalsComponent } from '../../modals/modals.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-refuse-pia',
  templateUrl: './refuse-pia.component.html',
  styleUrls: ['./refuse-pia.component.scss']
})
export class RefusePIAComponent implements OnInit {

  modal = new ModalsComponent(this.router);
  rejectionReasonForm: FormGroup;
  modificationsMadeForm: FormGroup;

  constructor(private el: ElementRef, private router: Router) {
    this.router = router;
  }

  ngOnInit() {
    this.rejectionReasonForm = new FormGroup({
      textarea: new FormControl()
    });
    this.modificationsMadeForm = new FormGroup({
      textarea: new FormControl()
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
    const rejectionReasonValue = this.rejectionReasonForm.value.textarea;
    const modificationsMadeValue = this.modificationsMadeForm.value.textarea;
    const buttons = this.el.nativeElement.querySelectorAll('.pia-entryContentBlock-content-cancelButtons button');
    setTimeout(()=>{
      if (rejectionReasonValue && rejectionReasonValue.length > 0 && document.activeElement.id != 'pia-modifications-made') {
        this.showRejectionReasonEditButton();
        this.rejectionReasonForm.controls['textarea'].disable();
        // TODO : save data
     }
     [].forEach.call(buttons, function(btn) {
        if (rejectionReasonValue) {
          btn.removeAttribute('disabled');
        } else {
          btn.setAttribute('disabled', true);
        }
      });
    },1);
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
    this.rejectionReasonForm.controls['textarea'].enable();
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
    const modificationsMadeValue = this.modificationsMadeForm.value.textarea;
    const resendButton = this.el.nativeElement.querySelector('.pia-entryContentBlock-footer > button');
    setTimeout(()=>{
      if (modificationsMadeValue && modificationsMadeValue.length > 0 && document.activeElement.id != 'pia-rejection-reason') {
        this.showModificationsMadeEditButton();
        this.modificationsMadeForm.controls['textarea'].disable();
        // TODO : save data
     }
      if (modificationsMadeValue) {
        resendButton.removeAttribute('disabled');
      } else {
        resendButton.setAttribute('disabled', true);
      }
    },1);
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
    this.modificationsMadeForm.controls['textarea'].enable();
  }

}
