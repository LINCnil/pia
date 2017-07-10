import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-refuse-pia',
  templateUrl: './refuse-pia.component.html',
  styleUrls: ['./refuse-pia.component.scss']
})
export class RefusePIAComponent implements OnInit {
  public rejectionReasonStatus: boolean;
  public modificationsMadeStatus: boolean;

  constructor(private el: ElementRef) { }

  ngOnInit() {
  }

  /**
   * Executes functionnalities when focusing rejection reason field.
   */
  rejectionReasonFocus() {
    this.hideEditButton1();
  }

  /**
   * Executes functionnalities when losing focus from rejection reason field.
   */
  rejectionReasonFocusOut(event) {
    const clickedBtn = event.target || event.srcElement || event.currentTarget;
/*    if (clickedBtn.value != '') {
      this.showEditButton1();
      this.rejectionReasonStatus = true;
    }*/
    // TODO : save data
  }

    /**
   * Executes functionnalities when focusing modifications made field.
   */
  modificationsMadeFocus() {
    this.hideEditButton2();
  }

  /**
   * Executes functionnalities when losing focus from modifications made field.
   */
  modificationsMadeFocusOut() {
      this.showEditButton2();
      this.modificationsMadeStatus = true;
      // TODO : save data
    }

  /**
   * Shows edit button for rejection reason field.
   */
  showEditButton1() {
    const editButton1 = document.getElementById('rejection-reason-btn');
    editButton1.classList.add('show');
  }

  /**
   * Hide edit button for rejection reason field.
   */
  hideEditButton1() {
    const editButton1 = document.getElementById('rejection-reason-btn');
    editButton1.classList.remove('show');
  }

  /**
   * Shows edit button for modifications made field.
   */
  showEditButton2() {
    const editButton2 = document.getElementById('rejection-reason-btn');
    editButton2.classList.add('show');
  }

  /**
   * Hide edit button for modifications made field.
   */
  hideEditButton2() {
    const editButton2 = document.getElementById('modifications-made-btn');
    editButton2.classList.remove('show');
  }

  /**
   * Enable rejection reason and modification made fields
   */
  activateEdition1() {
    const editButton1 = document.getElementById('rejection-reason-btn');
    editButton1.classList.remove('show');
    this.rejectionReasonStatus = false;
  }

  /**
   * Enable rejection reason and modification made fields
   */
  activateEdition2() {
    const editButton2 = document.getElementById('modifications-made-btn');
    editButton2.classList.remove('show');
    this.modificationsMadeStatus = false;
  }

}
