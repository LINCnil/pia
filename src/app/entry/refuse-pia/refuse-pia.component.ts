import {Component, ElementRef, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-refuse-pia',
  templateUrl: './refuse-pia.component.html',
  styleUrls: ['./refuse-pia.component.scss']
})
export class RefusePIAComponent implements OnInit {
  rejectionReasonForm: FormGroup;
  modificationsMadeForm: FormGroup;

  constructor(private el: ElementRef) { }

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
     if (this.rejectionReasonForm.value.textarea && this.rejectionReasonForm.value.textarea.length > 0) {
      this.showRejectionReasonEditButton();
      this.rejectionReasonForm.controls['textarea'].disable();
     }
    // TODO : save data
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
    if (this.modificationsMadeForm.value.textarea && this.modificationsMadeForm.value.textarea.length > 0) {
      this.showModificationsMadeEditButton();
      this.modificationsMadeForm.controls['textarea'].disable();
    }
      // TODO : save data
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
